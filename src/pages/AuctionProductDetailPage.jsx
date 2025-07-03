import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { auctionApi, bidApi } from "../services/api";
import { userApi } from "../services/api/users";
import HeaderNav from "../components/layout/HeaderNav";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useWebSocket } from "../hooks/useWebSocket";
import { useToastContext } from "../contexts/ToastContext";
import { JwtManager } from "../services/managers/JwtManager";

export default function AuctionProductDetailPage() {
    const { id } = useParams(); // auctionId
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const catalogId = searchParams.get('catalogId');

    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [bidPrice, setBidPrice] = useState("");
    const [bidPriceDisplay, setBidPriceDisplay] = useState("");
    const [bidLoading, setBidLoading] = useState(false);
    const [bids, setBids] = useState([]);
    const [bidPage, setBidPage] = useState(1);
    const [hasMoreBids, setHasMoreBids] = useState(true);
    const [timeLeft, setTimeLeft] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuctionOwner, setIsAuctionOwner] = useState(false);
    
    const [manualEndLoading, setManualEndLoading] = useState(false);
    const [isCancellingBid, setIsCancellingBid] = useState(false);
    
    const { subscribe, unsubscribe, isConnected } = useWebSocket();
    const { toast } = useToastContext();

    // 유효한 입찰이 있는지 확인하는 함수
    const hasValidBids = () => {
        // currentPrice가 0이면 유효한 입찰이 없음
        if (!auction || auction.currentPrice === 0) return false;
        
        if (!bids || bids.length === 0) return false;
        
        // 취소되지 않은 입찰이 있는지 확인
        return bids.some(bid => {
            const status = bid.status || bid.bidStatus;
            return status !== 'CANCEL' && status !== 'CANCELLED';
        });
    };

    // 현재가 재계산 함수
    const recalculateCurrentPrice = useCallback((bidList = bids) => {
        console.log('📢 현재가 재계산 시작, 입찰 목록:', bidList);
        
        if (!bidList) {
            console.log('📢 입찰 목록이 undefined/null이므로 재계산 스킵');
            return;
        }
        
        // 입찰 목록이 빈 배열이거나, 모든 입찰이 취소된 경우
        const validBids = bidList.filter(bid => {
            const status = bid.status || bid.bidStatus;
            return status !== 'CANCEL' && status !== 'CANCELLED';
        });
        
        console.log('📢 전체 입찰 수:', bidList.length, '유효한 입찰 수:', validBids.length);
        console.log('📢 유효한 입찰:', validBids);
        
        if (validBids.length === 0) {
            setAuction(prev => ({ ...prev, currentPrice: 0 }));
            console.log('📢 유효한 입찰이 없어 현재가를 0으로 설정');
        } else {
            const highestBid = Math.max(...validBids.map(bid => bid.bidPrice || bid.price));
            setAuction(prev => ({ ...prev, currentPrice: highestBid }));
            console.log('📢 최고 입찰가로 현재가 업데이트:', highestBid);
        }
    }, []);

    // 사용자 정보 확인
    useEffect(() => {
        const token = JwtManager.getJwt();
        const userInfo = JwtManager.getUserInfo();
        
        
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                
                // 모든 가능한 ID 필드 시도
                const possibleIds = [
                    payload.jti,        // JWT ID (이게 사용자 ID)
                    payload.userId, 
                    payload.id,
                    payload.user_id,
                    payload.memberId,
                    payload.accountId,
                    payload.sub
                ];
                
                const extractedId = possibleIds.find(id => id !== undefined && id !== null);
                
                let finalUser;
                if (userInfo && userInfo.id) {
                    finalUser = userInfo;
                } else {
                    // JWT에서 더 많은 정보 추출 시도
                    finalUser = {
                        id: extractedId,
                        nickname: payload.nickname || payload.username || payload.name || payload.preferred_username || userInfo?.nickname || '사용자',
                        email: payload.email || userInfo?.email
                    };
                }
                
                
                // ID를 숫자로 변환
                if (finalUser.id) {
                    finalUser.id = parseInt(finalUser.id);
                }
                
                setCurrentUser(finalUser);
                
                // 백엔드에서 실제 사용자 정보 가져오기 (닉네임 포함)
                if (finalUser.id) {
                    userApi.getMyProfile()
                        .then(userProfile => {
                            setCurrentUser(prev => ({
                                ...prev,
                                nickname: userProfile.nickname || prev.nickname,
                                email: userProfile.email || prev.email
                            }));
                        })
                        .catch(error => {
                            console.warn('사용자 정보 조회 실패:', error);
                        });
                }

            } catch (error) {
                console.error('JWT 파싱 오류:', error);
                setCurrentUser(userInfo);
            }
        } else {
            setCurrentUser(userInfo);
        }
    }, []);

    const fetchAuction = useCallback(async () => {
        if (!id) return;
        
        setLoading(true);
        setErrorMsg("");
        try {
            const data = await auctionApi.getAuction(id);
            setAuction(data);
        } catch (error) {
            console.error(error);
            setErrorMsg("경매 상품 정보를 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    // 경매 소유자 확인
    useEffect(() => {
        if (auction && currentUser) {
            const sellerId = parseInt(auction.sellerId || auction.sellerUserId || auction.userId);
            const currentUserId = parseInt(currentUser.id);
            const isOwner = sellerId === currentUserId && !isNaN(sellerId) && !isNaN(currentUserId);
            
            
            setIsAuctionOwner(isOwner);
        } else {
            setIsAuctionOwner(false);
        }
    }, [auction, currentUser]);
    
    const fetchBids = useCallback(async (page = 1, reset = false) => {
        try {
            const response = await bidApi.getAuctionBids(id, page, 5);
            
            let bidData = [];
            if (response.content) {
                bidData = response.content;
                setHasMoreBids(response.hasNext || false);
            } else if (Array.isArray(response)) {
                bidData = response;
                setHasMoreBids(false);
            }
            
            // 상태별 정렬 (낙찰 > 최신입찰 > 일반입찰 > 취소)
            const sortedBids = bidData.sort((a, b) => {
                const statusA = a.status || a.bidStatus;
                const statusB = b.status || b.bidStatus;
                
                // 상태별 우선순위
                const getStatusPriority = (status) => {
                    if (status === 'WON') return 1; // 낙찰 최우선
                    if (status === 'BID') return 2; // 입찰중
                    if (status === 'CANCEL') return 3; // 취소 최하위
                    return 2; // 기본값
                };
                
                const priorityA = getStatusPriority(statusA);
                const priorityB = getStatusPriority(statusB);
                
                // 상태 우선순위가 다르면 상태순 정렬
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                
                // 같은 상태면 날짜순 정렬
                const dateA = a.createdAt || a.bidTime || a.createTime;
                const dateB = b.createdAt || b.bidTime || b.createTime;
                
                if (dateA && dateB) {
                    return new Date(dateB) - new Date(dateA); // 최신순
                }
                
                // 날짜가 없으면 입찰가순
                const priceA = a.price || a.bidPrice || 0;
                const priceB = b.price || b.bidPrice || 0;
                return priceB - priceA;
            });
            
            setBids(prev => {
                const newBids = reset ? sortedBids : [...prev, ...sortedBids];
                
                // 입찰 목록 업데이트 후 즉시 현재가 재계산
                setTimeout(() => {
                    console.log('📢 fetchBids 완료 후 현재가 재계산, 새 입찰 목록:', newBids);
                    recalculateCurrentPrice(newBids);
                }, 0);
                
                return newBids;
            });
        } catch (error) {
            console.error('입찰 내역 조회 실패:', error);
        }
    }, [id]);
    
    // 입찰가 입력 핸들러
    const handleBidPriceChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
        setBidPrice(value);
        setBidPriceDisplay(value ? parseInt(value).toLocaleString() : '');
    };

    const handleBid = async () => {
        // 유효성 검사
        if (!currentUser) {
            toast.error('로그인이 필요합니다.');
            return;
        }
        
        if (isAuctionOwner) {
            toast.error('본인의 경매에는 입찰할 수 없습니다.');
            return;
        }
        
        if (!auction || auction.isWon || new Date(auction.endTime) < new Date()) {
            toast.error('종료된 경매에는 입찰할 수 없습니다.');
            return;
        }
        
        const currentBidPrice = parseInt(bidPrice);
        const minBidPrice = auction.currentPrice ? auction.currentPrice + 1000 : auction.startPrice;
        
        if (!bidPrice || isNaN(currentBidPrice) || currentBidPrice < minBidPrice) {
            toast.error(`최소 입찰가는 ${minBidPrice.toLocaleString()}원입니다.`);
            return;
        }
        
        setBidLoading(true);
        
        try {
            toast.info('입찰 처리 중입니다...');
            
            const response = await bidApi.createBid(id, { price: currentBidPrice });
            toast.success(`입찰이 성공적으로 완료되었습니다! (${currentBidPrice.toLocaleString()}원)`);
            setBidPrice('');
            setBidPriceDisplay('');

            // 입찰 목록만 새로고침
            await fetchBids(1, true);
            
        } catch (error) {
            console.error('입찰 오류:', error);
            
            let errorMessage = '입찰에 실패했습니다.';
            
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 400:
                        errorMessage = '잘못된 입찰 금액입니다. 최소 입찰가를 확인해주세요.';
                        break;
                    case 401:
                        errorMessage = '로그인이 필요합니다.';
                        break;
                    case 403:
                        errorMessage = '입찰 권한이 없습니다. 본인의 경매에는 입찰할 수 없습니다.';
                        break;
                    case 404:
                        errorMessage = '해당 경매를 찾을 수 없습니다.';
                        break;
                    case 409:
                        errorMessage = '이미 종료된 경매이거나 더 높은 입찰이 있습니다.';
                        break;
                    case 412:
                        errorMessage = '포인트가 부족합니다.';
                        break;
                    case 500:
                        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                        break;
                    default:
                        errorMessage = `입찰에 실패했습니다. (오류 코드: ${status})`;
                }
            } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
                errorMessage = '네트워크 연결을 확인해주세요.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setBidLoading(false);
        }
    };

    // 수동 낙찰 함수
    const handleManualEnd = async () => {
        // 경매 소유자 확인
        if (!isAuctionOwner) {
            toast.error('경매 소유자만 수동 낙찰할 수 있습니다.');
            return;
        }
        
        if (!auction || auction.isWon || new Date(auction.endTime) < new Date()) {
            toast.error('이미 종료된 경매에는 수동 낙찰할 수 없습니다.');
            return;
        }
        
        if (!bids.length) {
            toast.error('입찰이 없어 수동 낙찰할 수 없습니다.');
            return;
        }

        // 활성화된 입찰 중 최고가 찾기
        const activeBids = bids.filter(bid => (bid.status || bid.bidStatus) === 'BID');
        if (!activeBids.length) {
            toast.error('활성화된 입찰이 없어 수동 낙찰할 수 없습니다. 취소된 입찰만 있습니다.');
            return;
        }

        const highestBid = activeBids[0];
        const bidPrice = highestBid.price || highestBid.bidPrice || 0;
        const bidderNickname = highestBid.bidderNickname || highestBid.userNickname || '익명';
        
        // 입찰 데이터 구조 확인용 로그
        console.log('🔍 최고 입찰 데이터:', JSON.stringify(highestBid, null, 2));
        
        // 입찰자 닉네임을 백엔드로 전송 (백엔드에서 닉네임으로 사용자 찾기)
        const bidUserNickname = highestBid.bidUserNickname;
                          
        console.log('🔍 최고 입찰가:', bidPrice);
        console.log('🔍 최고 입찰자 닉네임:', bidUserNickname);
        
        const confirmMessage = `${bidderNickname}님의 ${bidPrice.toLocaleString()}원 입찰로 수동 낙찰하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`;
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        setManualEndLoading(true);
        
        try {
            toast.info('수동 낙찰 처리 중입니다...');
            
            console.log('📤 수동 낙찰 요청 데이터:', {
                bidPrice: bidPrice,
                bidUserNickname: bidUserNickname
            });
            
            const response = await auctionApi.endAuction(id, {
                bidPrice: bidPrice,
                bidUserNickname: bidUserNickname
            });
            
            toast.success(`🎉 수동 낙찰 완료!\n낙찰자: ${bidderNickname}\n낙찰가: ${bidPrice.toLocaleString()}원`);
            
            // 경매 상태 업데이트
            setTimeout(() => {
                fetchAuction();
            }, 1000);
            
        } catch (error) {
            console.error('수동 낙찰 오류:', error);
            
            let errorMessage = '수동 낙찰에 실패했습니다.';
            
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 400:
                        errorMessage = '잘못된 요청입니다. 입찰 정보를 확인해주세요.';
                        break;
                    case 401:
                        errorMessage = '로그인이 필요합니다.';
                        break;
                    case 403:
                        errorMessage = '경매 소유자만 수동 낙찰할 수 있습니다.';
                        break;
                    case 404:
                        errorMessage = '해당 경매를 찾을 수 없습니다.';
                        break;
                    case 409:
                        errorMessage = '이미 종료된 경매이거나 낙찰 처리가 불가능한 상태입니다.';
                        break;
                    case 500:
                        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                        break;
                    default:
                        errorMessage = `수동 낙찰에 실패했습니다. (오류 코드: ${status})`;
                }
            } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
                errorMessage = '네트워크 연결을 확인해주세요.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setManualEndLoading(false);
        }
    };

    // 경매 취소 함수
    const handleCancelAuction = async () => {
        const confirmMessage = '경매를 취소하시겠습니까?\n모든 입찰자에게 포인트가 반환됩니다.';
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        setManualEndLoading(true);
        
        try {
            toast.info('경매 취소 처리 중입니다...');
            
            const response = await auctionApi.deleteAuction(id);
            
            // 성공 Toast 알림
            toast.success('경매가 성공적으로 취소되었습니다! 모든 입찰자에게 포인트가 반환됩니다.');
            
            // 웹소켓 연결 해제
            try {
                unsubscribe(`/topic/auction/${id}/bid`);
                unsubscribe(`/topic/auction/${id}/won`);
                unsubscribe(`/topic/auction/${id}/failed`);
                unsubscribe(`/topic/auction/${id}/deleted`);
            } catch (wsError) {
                console.warn('WebSocket 연결 해제 실패:', wsError);
            }
            
            // 메인 페이지로 이동
            setTimeout(() => {
                navigate('/');
            }, 1500);
            
        } catch (error) {
            console.error('경매 취소 오류:', error);
            
            // 구체적인 에러 메시지 처리
            let errorMessage = '경매 취소에 실패했습니다.';
            
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 400:
                        errorMessage = '잘못된 요청입니다. 경매 상태를 확인해주세요.';
                        break;
                    case 401:
                        errorMessage = '로그인이 필요합니다.';
                        break;
                    case 403:
                        errorMessage = '경매 취소 권한이 없습니다.';
                        break;
                    case 404:
                        errorMessage = '해당 경매를 찾을 수 없습니다.';
                        break;
                    case 409:
                        errorMessage = '이미 종료된 경매는 취소할 수 없습니다.';
                        break;
                    case 500:
                        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                        break;
                    default:
                        errorMessage = `경매 취소에 실패했습니다. (오류 코드: ${status})`;
                }
            } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
                errorMessage = '네트워크 연결을 확인해주세요.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setManualEndLoading(false);
        }
    };

    // 입찰 취소 함수
    const handleCancelBid = async (bid) => {
        const bidPrice = bid.price || bid.bidPrice;
        const confirmMessage = `${bidPrice.toLocaleString()}원 입찰을 취소하시겠습니까?`;
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setIsCancellingBid(true);
            toast.info('입찰 취소 처리 중입니다...');
            
            const response = await bidApi.deleteBid(id, bidPrice);
            toast.success('입찰이 성공적으로 취소되었습니다. 포인트가 반환되었습니다.');
            
            // 입찰 목록과 경매 정보 즉시 새로고침
            await Promise.all([
                fetchBids(1, true),
                fetchAuction()
            ]);
            
            setIsCancellingBid(false);
            
        } catch (error) {
            console.error('입찰 취소 오류:', error);
            
            let errorMessage = '입찰 취소에 실패했습니다.';
            
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 400:
                        errorMessage = '잘못된 요청입니다. 입찰 정보를 확인해주세요.';
                        break;
                    case 401:
                        errorMessage = '로그인이 필요합니다.';
                        break;
                    case 403:
                        errorMessage = '본인의 입찰만 취소할 수 있습니다.';
                        break;
                    case 404:
                        errorMessage = '해당 입찰을 찾을 수 없습니다.';
                        break;
                    case 409:
                        errorMessage = '이미 취소되었거나 종료된 입찰입니다.';
                        break;
                    case 500:
                        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                        break;
                    default:
                        errorMessage = `입찰 취소에 실패했습니다. (오류 코드: ${status})`;
                }
            } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
                errorMessage = '네트워크 연결을 확인해주세요.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
            setIsCancellingBid(false);
        }
    };
    
    // WebSocket 구독 설정
    useEffect(() => {
        if (!isConnected() || !id) return;
        
        const handleBidUpdate = (message) => {
            try {
                const bidUpdate = JSON.parse(message.body);
                console.log('📢 입찰 업데이트 받음:', bidUpdate);
                
                const isCancelMessage = bidUpdate.bidStatus === 'CANCEL';
                const isNewBid = !isCancelMessage && bidUpdate.bidPrice;
                
                console.log('📢 메시지 타입:', isCancelMessage ? '입찰 취소' : '새 입찰');
                
                if (isNewBid) {
                    // 새 입찰인 경우 - 입찰가로 현재가 업데이트 + 입찰 목록 새로고침
                    setAuction(prev => ({
                        ...prev,
                        currentPrice: bidUpdate.bidPrice
                    }));
                    console.log('📢 새 입찰로 현재가 업데이트:', bidUpdate.bidPrice);
                    
                    // 입찰 목록도 새로고침
                    fetchBids(1, true);
                } else if (isCancelMessage) {
                    // 입찰 취소인 경우 - 입찰 목록을 새로고침한 후 현재가 재계산
                    console.log('📢 입찰 취소 감지 - 현재가 재계산 필요');
                    
                    // 입찰 목록 새로고침
                    fetchBids(1, true);
                    
                    // 현재 입찰 목록에서 즉시 재계산도 실행 (fallback)
                    setTimeout(() => {
                        console.log('📢 입찰 취소 후 fallback 재계산 실행');
                        recalculateCurrentPrice(bids);
                    }, 300);
                } else {
                    // 일반적인 경우 입찰 목록만 새로고침
                    fetchBids(1, true);
                }
                
            } catch (error) {
                console.error('입찰 업데이트 처리 오류:', error);
            }
        };
        
        const handleWonUpdate = (message) => {
            try {
                const wonUpdate = JSON.parse(message.body);
                console.log('🏆 낙찰 업데이트 받음 - 전체 데이터:', JSON.stringify(wonUpdate, null, 2));
                
                // 다양한 가능한 필드명들 시도
                const finalPrice = wonUpdate.finalPrice || 
                                 wonUpdate.currentPrice || 
                                 wonUpdate.price || 
                                 wonUpdate.bidPrice ||
                                 wonUpdate.wonBidPrice ||
                                 wonUpdate.auctionPrice ||
                                 wonUpdate.endPrice ||
                                 wonUpdate.wonPrice ||
                                 auction?.currentPrice;  // 현재 경매가를 fallback으로 사용
                
                console.log('🏆 추출된 낙찰가:', finalPrice);
                console.log('🏆 가능한 모든 필드:', Object.keys(wonUpdate));
                console.log('🏆 현재 경매가 (fallback):', auction?.currentPrice);
                
                setAuction(prev => ({
                    ...prev,
                    isWon: true,
                    currentPrice: finalPrice || prev.currentPrice,  // finalPrice가 없으면 기존 currentPrice 유지
                    endTime: new Date().toISOString() // 현재 시간으로 종료 시간 업데이트
                }));
                
                // 입찰 목록 새로고침하여 낙찰 상태 반영
                fetchBids(1, true);
                
                // 경매 정보도 새로고침
                fetchAuction();
                
                const displayPrice = finalPrice || auction?.currentPrice;
                toast.success(`🎉 낙찰 완료!\n최종 낙찰가: ${displayPrice ? displayPrice.toLocaleString() : '정보 없음'}원`);
            } catch (error) {
                console.error('낙찰 업데이트 처리 오류:', error);
            }
        };
        
        const handleFailedUpdate = (message) => {
            try {
                const failedUpdate = JSON.parse(message.body);
                const currentPrice = failedUpdate.wonBidPrice || failedUpdate.currentPrice || failedUpdate.finalPrice || 0;
                
                setAuction(prev => ({
                    ...prev,
                    isFailed: true,
                    currentPrice: currentPrice,
                    endTime: new Date().toISOString() // 현재 시간으로 종료 시간 업데이트
                }));
                
                // currentPrice가 0이면 입찰이 없었던 것
                const toastMessage = currentPrice === 0 
                    ? '입찰이 없어 유찰되었습니다.' 
                    : '경매가 유찰되었습니다.';
                toast.warning(`😔 ${toastMessage}`);
            } catch (error) {
                console.error('유찰 업데이트 처리 오류:', error);
            }
        };

        const handleDeletedUpdate = (message) => {
            try {
                const deletedUpdate = JSON.parse(message.body);
                
                // 경매 삭제 알림
                alert('📢 경매가 판매자에 의해 취소되었습니다!\n입찰하신 포인트는 자동으로 반환됩니다.');
                toast.warning('경매가 취소되었습니다. 메인 페이지로 이동합니다.');
                
                // 3초 후 메인 페이지로 이동
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } catch (error) {
                console.error('경매 삭제 업데이트 처리 오류:', error);
            }
        };
        
        // 구독 설정
        const setupSubscriptions = async () => {
            try {
                await subscribe(`/topic/auction/${id}/bid`, handleBidUpdate);
                await subscribe(`/topic/auction/${id}/won`, handleWonUpdate);
                await subscribe(`/topic/auction/${id}/failed`, handleFailedUpdate);
                await subscribe(`/topic/auction/${id}/deleted`, handleDeletedUpdate);
            } catch (error) {
                console.error('WebSocket 구독 설정 실패:', error);
            }
        };
        
        setupSubscriptions();
        
        return () => {
            unsubscribe(`/topic/auction/${id}/bid`);
            unsubscribe(`/topic/auction/${id}/won`);
            unsubscribe(`/topic/auction/${id}/failed`);
            unsubscribe(`/topic/auction/${id}/deleted`);
        };
    }, [isConnected, id, fetchBids, toast, subscribe, unsubscribe]);
    
    // 남은 시간 계산 함수
    const calculateTimeLeft = useCallback(() => {
        if (!auction?.endTime) return "";
        
        const now = new Date().getTime();
        const endTime = new Date(auction.endTime).getTime();
        const difference = endTime - now;
        
        if (difference <= 0) {
            return "종료됨";
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        if (days > 0) return `${days}일 ${hours}시간 ${minutes}분`;
        if (hours > 0) return `${hours}시간 ${minutes}분 ${seconds}초`;
        if (minutes > 0) return `${minutes}분 ${seconds}초`;
        return `${seconds}초`;
    }, [auction?.endTime]);
    
    // 실시간 카운트다운
    useEffect(() => {
        if (!auction?.endTime) return;
        
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        
        return () => clearInterval(timer);
    }, [auction?.endTime, calculateTimeLeft]);
    
    useEffect(() => {
        fetchAuction();
        fetchBids(1, true);
    }, [fetchAuction, fetchBids]);

    // 입찰 목록이 업데이트될 때마다 현재가 재계산
    useEffect(() => {
        if (bids !== null && bids !== undefined) { // null이 아닌 모든 경우 (빈 배열 포함)
            console.log('📢 useEffect에서 입찰 목록 변경 감지, 현재가 재계산 실행');
            recalculateCurrentPrice(bids);
        }
    }, [bids]);

    if (loading) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <HeaderNav />
                <div style={{
                    maxWidth: 700,
                    margin: "40px auto",
                    background: "#fff",
                    borderRadius: 14,
                    padding: 42,
                    boxShadow: "0 4px 24px #0001",
                    textAlign: "center"
                }}>
                    <LoadingSpinner size="large" message="경매 정보를 불러오는 중..." />
                </div>
            </div>
        );
    }

    if (!auction) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <HeaderNav />
                <div style={{
                    maxWidth: 700,
                    margin: "40px auto",
                    background: "#fff",
                    borderRadius: 14,
                    padding: 42,
                    boxShadow: "0 4px 24px #0001",
                    textAlign: "center"
                }}>
                    <h2>경매 상품을 찾을 수 없습니다.</h2>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            marginTop: 18,
                            padding: "10px 24px",
                            borderRadius: 8,
                            background: "#7f56fd",
                            color: "#fff",
                            fontWeight: 500,
                            fontSize: 16,
                            border: "none"
                        }}
                    >
                        메인으로
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <HeaderNav />
            <div style={{
                maxWidth: 700,
                margin: "40px auto",
                background: "#fff",
                borderRadius: 14,
                padding: 42,
                boxShadow: "0 4px 24px #0001"
            }}>
                {/* 경매 상태 라벨 */}
                <div style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    backgroundColor: auction.isWon ? "#28a745" : auction.isFailed ? "#6c757d" : new Date(auction.endTime) < new Date() ? "#dc3545" : "#7f56fd",
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginBottom: "12px"
                }}>
                    {auction.isWon ? "낙찰 완료" : auction.isFailed ? "유찰" : new Date(auction.endTime) < new Date() ? "경매 종료" : "경매 진행중"}
                </div>

                {/* 이미지 렌더링 */}
                {auction.productImageUrl ? (
                    <img
                        src={auction.productImageUrl}
                        alt={auction.productName}
                        style={{ width: "100%", borderRadius: 12, maxHeight: 340, objectFit: "cover" }}
                    />
                ) : (
                    <div style={{
                        width: "100%", height: 280, background: "#ddd",
                        borderRadius: 12, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 16, color: "#666"
                    }}>
                        이미지 없음
                    </div>
                )}

                {/* 상품 정보 */}
                <div style={{ marginTop: 26, fontSize: 27, fontWeight: 700 }}>
                    {auction.productName}
                </div>
                <div style={{ margin: "10px 0 18px 0", color: "#333", fontSize: 18, fontWeight: 700 }}>
                    판매자: {auction.sellerNickname}
                </div>

                {/* 카탈로그 링크 */}
                {catalogId && (
                    <div style={{ 
                        marginTop: 18, 
                        marginBottom: 18,
                        padding: "12px 16px", 
                        backgroundColor: "#f8fafc", 
                        borderRadius: 8,
                        border: "1px solid #e2e8f0"
                    }}>
                        <span style={{ fontSize: 14, color: "#666", marginRight: 8 }}>
                            📖 제품 카탈로그:
                        </span>
                        <button 
                            onClick={() => navigate(`/catalogs/${catalogId}`)}
                            style={{ 
                                color: "#7f56fd", 
                                textDecoration: "underline", 
                                background: "none", 
                                border: "none", 
                                cursor: "pointer",
                                fontSize: 14,
                                fontWeight: 500
                            }}
                        >
                            상세 사양 및 리뷰 보기 →
                        </button>
                    </div>
                )}
                {/* 가격 정보 카드 */}
                <div style={{ 
                    display: "flex", 
                    gap: 20, 
                    marginTop: 24, 
                    marginBottom: 20 
                }}>
                    {/* 시작가 */}
                    <div style={{
                        flex: 1,
                        padding: "18px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: 10,
                        border: "1px solid #d1d5db",
                        textAlign: "center"
                    }}>
                        <div style={{ 
                            fontSize: 14, 
                            color: "#6b7280", 
                            fontWeight: 700, 
                            marginBottom: 8,
                            textTransform: "uppercase",
                            letterSpacing: "1px"
                        }}>
                            시작가
                        </div>
                        <div style={{ 
                            fontSize: 20, 
                            color: "#374151", 
                            fontWeight: 700 
                        }}>
                            {auction.startPrice.toLocaleString()}원
                        </div>
                    </div>
                    
                    {/* 현재가 */}
                    <div style={{
                        flex: 1.5,
                        padding: "18px",
                        background: auction.currentPrice > 0 && hasValidBids()
                            ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" 
                            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
                        borderRadius: 10,
                        textAlign: "center",
                        boxShadow: auction.currentPrice > 0 && hasValidBids() ? "0 4px 15px rgba(59, 130, 246, 0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        <div style={{ 
                            fontSize: 16, 
                            color: auction.currentPrice > 0 && hasValidBids() ? "rgba(255,255,255,0.9)" : "#6b7280", 
                            fontWeight: 700, 
                            marginBottom: 8,
                            textTransform: "uppercase",
                            letterSpacing: "1px"
                        }}>
                            현재가
                        </div>
                        <div style={{ 
                            fontSize: 28, 
                            color: auction.currentPrice > 0 && hasValidBids() ? "#ffffff" : "#9ca3af", 
                            fontWeight: 900,
                            textShadow: auction.currentPrice > 0 && hasValidBids() ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
                            lineHeight: 1.2
                        }}>
                            {auction.currentPrice > 0 && hasValidBids() ? 
                                `${auction.currentPrice.toLocaleString()}원` : 
                                "입찰 대기중"
                            }
                        </div>
                        {auction.currentPrice > 0 && hasValidBids() && (
                            <div style={{
                                position: "absolute",
                                top: -8,
                                right: -8,
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                backgroundColor: "#10b981",
                                animation: "pulse 2s infinite"
                            }}></div>
                        )}
                    </div>
                </div>
                {/* 경매 정보 카드들 */}
                <div style={{ 
                    display: "flex", 
                    gap: 16, 
                    marginTop: 18 
                }}>
                    {/* 남은 시간 */}
                    <div style={{ 
                        flex: 2.5,
                        padding: "20px",
                        background: (() => {
                            if (timeLeft === "종료됨") return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
                            if (timeLeft.includes("분") && !timeLeft.includes("시간") && !timeLeft.includes("일")) return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
                            return "linear-gradient(135deg, #059669 0%, #047857 100%)";
                        })(),
                        borderRadius: 10,
                        color: "white",
                        textAlign: "center",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        <div style={{ 
                            fontSize: 14, 
                            color: "rgba(255,255,255,0.9)", 
                            fontWeight: 700, 
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: "1px"
                        }}>
                            {timeLeft === "종료됨" ? "상태" : "남은 시간"}
                        </div>
                        <div style={{ 
                            fontSize: 20, 
                            fontWeight: 900,
                            textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                            lineHeight: 1.1
                        }}>
                            {timeLeft === "종료됨" ? "⏰ 경매 종료" : `⏱️ ${timeLeft}`}
                        </div>
                        {timeLeft !== "종료됨" && timeLeft.includes("분") && !timeLeft.includes("시간") && (
                            <div style={{
                                position: "absolute",
                                top: -6,
                                right: -6,
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: "#fbbf24",
                                animation: "pulse 1s infinite"
                            }}></div>
                        )}
                    </div>
                    
                    {/* 입찰 수 */}
                    <div style={{
                        flex: 1,
                        padding: "20px 16px",
                        backgroundColor: "#f8fafc",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        textAlign: "center"
                    }}>
                        <div style={{ 
                            fontSize: 14, 
                            color: "#64748b", 
                            fontWeight: 700, 
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: "1px"
                        }}>
                            입찰 수
                        </div>
                        <div style={{ 
                            fontSize: 20, 
                            color: "#334155", 
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4
                        }}>
                            🔥 {auction.bidCount || 0}
                        </div>
                    </div>
                </div>
                
                {/* 마감 시간 */}
                <div style={{ 
                    marginTop: 14,
                    padding: "14px 18px",
                    backgroundColor: "#f9fafb",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    textAlign: "center"
                }}>
                    <div style={{ 
                        fontSize: 14, 
                        color: "#6b7280", 
                        fontWeight: 700,
                        marginBottom: 5,
                        textTransform: "uppercase",
                        letterSpacing: "1px"
                    }}>
                        마감 예정
                    </div>
                    <div style={{ 
                        fontSize: 16, 
                        color: "#374151",
                        fontWeight: 700
                    }}>
                        📅 {new Date(auction.endTime).toLocaleString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>

                
                {/* 종료된 경매 안내 */}
                {auction && (auction.isWon || auction.isFailed || new Date(auction.endTime) < new Date()) && (
                    <div style={{ 
                        marginTop: 36, 
                        padding: 20, 
                        backgroundColor: auction.isWon ? "#d4edda" : auction.isFailed ? "#e2e3e5" : "#f8d7da", 
                        borderRadius: 8,
                        border: `1px solid ${auction.isWon ? "#c3e6cb" : auction.isFailed ? "#d1ecf1" : "#f5c6cb"}`,
                        textAlign: "center"
                    }}>
                        <h3 style={{ 
                            margin: "0 0 8px 0", 
                            fontSize: 18, 
                            fontWeight: 600,
                            color: auction.isWon ? "#155724" : auction.isFailed ? "#0c5460" : "#721c24"
                        }}>
                            {auction.isWon ? "🎉 낙찰 완료!" : auction.isFailed ? "😔 유찰" : "⏰ 경매 종료"}
                        </h3>
                        <p style={{ 
                            margin: 0, 
                            fontSize: 14, 
                            color: auction.isWon ? "#155724" : auction.isFailed ? "#0c5460" : "#721c24"
                        }}>
                            {auction.isWon 
                                ? `최종 낙찰가: ${auction.currentPrice ? auction.currentPrice.toLocaleString() : '정보 없음'}원`
                                : auction.isFailed 
                                    ? (auction.currentPrice === 0 ? "입찰이 없어 유찰되었습니다." : "경매가 유찰되었습니다.")
                                    : "경매 시간이 종료되었습니다."
                            }
                        </p>
                    </div>
                )}


                {/* 경매 소유자용 수동 낙찰 섹션 */}
                {auction && !auction.isWon && new Date(auction.endTime) >= new Date() && isAuctionOwner && (
                    <div style={{ marginTop: 36, padding: 20, backgroundColor: "#fff3cd", borderRadius: 8, border: "2px solid #ffeaa7" }}>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 600, color: "#856404" }}>
                            🏆 경매 관리
                        </h3>
                        
                        {(() => {
                            // 유효한 입찰만 필터링
                            const validBids = bids.filter(bid => {
                                const status = bid.status || bid.bidStatus;
                                return status !== 'CANCEL' && status !== 'CANCELLED';
                            });
                            
                            return validBids.length > 0 ? (
                                <>
                                    <div style={{ 
                                        padding: "16px", 
                                        backgroundColor: "#ffffff", 
                                        borderRadius: 8, 
                                        marginBottom: 16,
                                        border: "1px solid #ffeaa7"
                                    }}>
                                        <div style={{ fontSize: 14, color: "#856404", marginBottom: 8 }}>
                                            현재 최고 입찰가
                                        </div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: "#b8860b" }}>
                                            {(validBids[0].price || validBids[0].bidPrice || 0).toLocaleString()}원
                                        </div>
                                        <div style={{ fontSize: 12, color: "#856404", marginTop: 4 }}>
                                            입찰자: {validBids[0].bidderNickname || validBids[0].bidUserNickname || validBids[0].userNickname || '익명'}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 14, color: "#856404", marginBottom: 12, textAlign: "center" }}>
                                        현재 최고 입찰자에게 즉시 낙찰하거나 경매를 취소할 수 있습니다.
                                    </div>
                                </>
                            ) : (
                            <div style={{ 
                                padding: "16px", 
                                backgroundColor: "#f8f9fa", 
                                borderRadius: 8, 
                                marginBottom: 16,
                                border: "1px solid #dee2e6",
                                textAlign: "center"
                            }}>
                                <div style={{ fontSize: 16, color: "#6c757d", marginBottom: 8 }}>
                                    아직 입찰이 없습니다
                                </div>
                                <div style={{ fontSize: 12, color: "#6c757d" }}>
                                    입찰자를 기다리거나 경매를 취소할 수 있습니다.
                                </div>
                            </div>
                            );
                        })()}
                        <div style={{ display: "flex", gap: 12 }}>
                            {(() => {
                                // 유효한 입찰 수 계산
                                const validBidsCount = bids.filter(bid => {
                                    const status = bid.status || bid.bidStatus;
                                    return status !== 'CANCEL' && status !== 'CANCELLED';
                                }).length;
                                
                                return (
                                    <button
                                        onClick={handleManualEnd}
                                        disabled={manualEndLoading || validBidsCount === 0}
                                        style={{
                                            flex: 2,
                                            padding: "16px",
                                            background: manualEndLoading || validBidsCount === 0 ? "#ccc" : "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: 8,
                                            fontSize: 16,
                                            fontWeight: 600,
                                            cursor: manualEndLoading || validBidsCount === 0 ? "not-allowed" : "pointer",
                                            boxShadow: manualEndLoading || validBidsCount === 0 ? "none" : "0 4px 12px rgba(243, 156, 18, 0.3)",
                                            transition: "all 0.2s ease",
                                            opacity: validBidsCount === 0 ? 0.6 : 1
                                        }}
                                        onMouseOver={(e) => {
                                            if (!manualEndLoading && validBidsCount > 0) {
                                                e.target.style.transform = "translateY(-2px)";
                                                e.target.style.boxShadow = "0 6px 16px rgba(243, 156, 18, 0.4)";
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!manualEndLoading && validBidsCount > 0) {
                                                e.target.style.transform = "translateY(0)";
                                                e.target.style.boxShadow = "0 4px 12px rgba(243, 156, 18, 0.3)";
                                            }
                                        }}
                                    >
                                        {manualEndLoading ? "처리 중..." : validBidsCount === 0 ? "🏆 낙찰 (입찰 필요)" : "🏆 수동 낙찰"}
                                    </button>
                                );
                            })()}
                            
                            <button
                                onClick={handleCancelAuction}
                                disabled={manualEndLoading}
                                style={{
                                    flex: 1,
                                    padding: "16px",
                                    background: manualEndLoading ? "#ccc" : "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: manualEndLoading ? "not-allowed" : "pointer",
                                    boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseOver={(e) => {
                                    if (!manualEndLoading) {
                                        e.target.style.transform = "translateY(-2px)";
                                        e.target.style.boxShadow = "0 6px 16px rgba(231, 76, 60, 0.4)";
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!manualEndLoading) {
                                        e.target.style.transform = "translateY(0)";
                                        e.target.style.boxShadow = "0 4px 12px rgba(231, 76, 60, 0.3)";
                                    }
                                }}
                            >
                                ❌ 경매 취소
                            </button>
                        </div>
                    </div>
                )}

                {/* 경매 소유자용 입찰 대기 메시지 */}
                {auction && !auction.isWon && new Date(auction.endTime) >= new Date() && isAuctionOwner && bids.length === 0 && (
                    <div style={{ marginTop: 36, padding: 20, backgroundColor: "#e3f2fd", borderRadius: 8, border: "2px solid #90caf9" }}>
                        <div style={{ textAlign: "center", marginBottom: 16 }}>
                            <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 600, color: "#1565c0" }}>
                                📢 내 경매
                            </h3>
                            <p style={{ margin: 0, fontSize: 14, color: "#1976d2" }}>
                                아직 입찰이 없습니다. 입찰자를 기다리고 있어요! 🕒
                            </p>
                        </div>
                        <button
                            onClick={handleCancelAuction}
                            disabled={manualEndLoading}
                            style={{
                                width: "100%",
                                padding: "12px",
                                background: manualEndLoading ? "#ccc" : "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: manualEndLoading ? "not-allowed" : "pointer",
                                boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
                                transition: "all 0.2s ease"
                            }}
                            onMouseOver={(e) => {
                                if (!manualEndLoading) {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 6px 16px rgba(231, 76, 60, 0.4)";
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!manualEndLoading) {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 4px 12px rgba(231, 76, 60, 0.3)";
                                }
                            }}
                        >
                            {manualEndLoading ? "처리 중..." : "❌ 경매 취소하기"}
                        </button>
                    </div>
                )}

                {/* 로그인 안한 사용자용 메시지 */}
                {auction && !auction.isWon && new Date(auction.endTime) >= new Date() && !currentUser && (
                    <div style={{ marginTop: 36, padding: 20, backgroundColor: "#f8f9fa", borderRadius: 8, textAlign: "center", border: "2px solid #dee2e6" }}>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 600, color: "#495057" }}>
                            🔐 로그인이 필요합니다
                        </h3>
                        <p style={{ margin: "0 0 16px 0", fontSize: 14, color: "#6c757d" }}>
                            입찰하려면 로그인해주세요
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer"
                            }}
                        >
                            로그인하러 가기
                        </button>
                    </div>
                )}


                {/* 경매 소유자 안내 메시지 */}
                {auction && !auction.isWon && new Date(auction.endTime) >= new Date() && isAuctionOwner && currentUser && (
                    <div style={{ 
                        marginTop: 36, 
                        padding: 20, 
                        backgroundColor: "#e3f2fd", 
                        borderRadius: 8, 
                        border: "2px solid #90caf9",
                        textAlign: "center" 
                    }}>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 600, color: "#1565c0" }}>
                            📢 내가 등록한 경매
                        </h3>
                        <p style={{ margin: 0, fontSize: 14, color: "#1976d2" }}>
                            자신의 경매에는 입찰할 수 없습니다. 위의 경매 관리 섹션에서 낙찰 및 취소를 관리하세요.
                        </p>
                    </div>
                )}

                {/* 일반 사용자용 입찰 섹션 */}
                {auction && !auction.isWon && new Date(auction.endTime) >= new Date() && !isAuctionOwner && currentUser && (
                    <div style={{ marginTop: 36, padding: 20, backgroundColor: "#f8f9fa", borderRadius: 8 }}>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 600 }}>입찰하기</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <div style={{ flex: 1, position: "relative" }}>
                                <input
                                    type="text"
                                    value={bidPriceDisplay}
                                    onChange={handleBidPriceChange}
                                    placeholder={`최소 ${(auction.currentPrice ? auction.currentPrice + 1000 : auction.startPrice).toLocaleString()}원`}
                                    style={{
                                        width: "100%",
                                        padding: "16px 20px",
                                        border: "2px solid #e2e8f0",
                                        borderRadius: 12,
                                        fontSize: 18,
                                        fontWeight: 600,
                                        color: "#2d3748",
                                        backgroundColor: "#ffffff",
                                        transition: "all 0.3s ease",
                                        outline: "none",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = "#667eea";
                                        e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.15)";
                                        e.target.style.transform = "translateY(-1px)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = "#e2e8f0";
                                        e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                                        e.target.style.transform = "translateY(0)";
                                    }}
                                    onMouseEnter={(e) => {
                                        if (document.activeElement !== e.target) {
                                            e.target.style.borderColor = "#cbd5e0";
                                            e.target.style.boxShadow = "0 3px 8px rgba(0,0,0,0.1)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (document.activeElement !== e.target) {
                                            e.target.style.borderColor = "#e2e8f0";
                                            e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                                        }
                                    }}
                                />
                                <span style={{ 
                                    position: "absolute",
                                    right: 20,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: 16, 
                                    color: "#718096",
                                    fontWeight: 500,
                                    pointerEvents: "none"
                                }}>원</span>
                            </div>
                        </div>
                        <button
                            onClick={handleBid}
                            disabled={bidLoading}
                            style={{
                                background: bidLoading ? "#ccc" : "#7f56fd",
                                color: "#fff",
                                padding: "12px 24px",
                                borderRadius: 6,
                                fontWeight: 500,
                                fontSize: 16,
                                border: "none",
                                cursor: bidLoading ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease"
                            }}
                            onMouseOver={(e) => {
                                if (!bidLoading) {
                                    e.target.style.background = "#6d47ed";
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!bidLoading) {
                                    e.target.style.background = "#7f56fd";
                                }
                            }}
                        >
                            {bidLoading ? "입찰 중..." : "입찰하기"}
                        </button>
                    </div>
                )}
                
                {/* 입찰 내역 */}
                {bids.length > 0 && (
                    <div style={{ marginTop: 32 }}>
                        <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            marginBottom: 20 
                        }}>
                            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#2d3748" }}>
                                입찰 현황
                            </h3>
                            <div style={{ 
                                fontSize: 14, 
                                color: "#718096",
                                backgroundColor: "#f7fafc",
                                padding: "6px 12px",
                                borderRadius: 16,
                                fontWeight: 500
                            }}>
                                총 {bids.length}건
                            </div>
                        </div>
                        <div style={{ 
                            maxHeight: 400, 
                            overflowY: "auto", 
                            border: "1px solid #e2e8f0", 
                            borderRadius: 12,
                            backgroundColor: "#ffffff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}>
                            {bids.map((bid, index) => {
                                                return (
                                <div key={index} style={{
                                    padding: "20px 24px",
                                    borderBottom: index < bids.length - 1 ? "1px solid #e2e8f0" : "none",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    backgroundColor: (() => {
                                        const status = bid.status || bid.bidStatus;
                                        if (status === 'WON') return "linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)"; // 낙찰: 그라데이션 초록
                                        if (status === 'CANCEL') return "linear-gradient(135deg, #fef5f5 0%, #fed7d7 100%)"; // 취소: 그라데이션 빨강
                                        if (index === 0 && status === 'BID') return "linear-gradient(135deg, #f7faff 0%, #edf2ff 100%)"; // 최신: 그라데이션 보라
                                        return index % 2 === 0 ? "#fafafa" : "#ffffff"; // 줄무늬 효과
                                    })(),
                                    borderLeft: (() => {
                                        const status = bid.status || bid.bidStatus;
                                        if (status === 'WON') return "4px solid #48bb78"; // 낙찰: 초록
                                        if (status === 'CANCEL') return "4px solid #f56565"; // 취소: 빨강
                                        if (index === 0 && status === 'BID') return "4px solid #667eea"; // 최신: 보라
                                        return "4px solid transparent";
                                    })(),
                                    opacity: (bid.status || bid.bidStatus) === 'CANCEL' ? 0.75 : 1,
                                    transition: "all 0.2s ease",
                                    cursor: "default",
                                    position: "relative"
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                            {(bid.price || bid.bidPrice || 0).toLocaleString()}원
                                            {/* 입찰 상태 배지 */}
                                            {(() => {
                                                const status = bid.status || bid.bidStatus;
                                                if (status === 'WON') {
                                                    return (
                                                        <span style={{
                                                            fontSize: 11,
                                                            padding: "4px 10px",
                                                            background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
                                                            color: "white",
                                                            borderRadius: 12,
                                                            fontWeight: "600",
                                                            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                            boxShadow: "0 2px 4px rgba(72, 187, 120, 0.3)"
                                                        }}>
                                                            🏆 낙찰
                                                        </span>
                                                    );
                                                } else if (status === 'CANCEL') {
                                                    return (
                                                        <span style={{
                                                            fontSize: 11,
                                                            padding: "4px 10px",
                                                            background: "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
                                                            color: "white",
                                                            borderRadius: 12,
                                                            fontWeight: "600",
                                                            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                            boxShadow: "0 2px 4px rgba(245, 101, 101, 0.3)"
                                                        }}>
                                                            ❌ 취소
                                                        </span>
                                                    );
                                                } else if (status === 'BID') {
                                                    return index === 0 ? (
                                                        <span style={{
                                                            fontSize: 11,
                                                            padding: "4px 10px",
                                                            background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                                                            color: "white",
                                                            borderRadius: 12,
                                                            fontWeight: "600",
                                                            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                            boxShadow: "0 2px 4px rgba(243, 156, 18, 0.3)",
                                                            animation: "pulse 2s infinite"
                                                        }}>
                                                            👑 최고가 (낙찰 대상)
                                                        </span>
                                                    ) : (
                                                        <span style={{
                                                            fontSize: 11,
                                                            padding: "4px 10px",
                                                            background: "linear-gradient(135deg, #a0aec0 0%, #718096 100%)",
                                                            color: "white",
                                                            borderRadius: 12,
                                                            fontWeight: "600",
                                                            textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                                        }}>
                                                            💰 입찰
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                        <div style={{ 
                                            fontSize: 14, 
                                            color: "#4a5568", 
                                            marginTop: 4,
                                            fontWeight: 500,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6
                                        }}>
                                            <span style={{ 
                                                width: 8, 
                                                height: 8, 
                                                borderRadius: "50%", 
                                                backgroundColor: "#48bb78",
                                                display: "inline-block"
                                            }}></span>
                                            {bid.bidderNickname || bid.userNickname || "익명 사용자"}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        textAlign: "right",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                        gap: 8
                                    }}>
                                        <div style={{ 
                                            fontSize: 13, 
                                            color: "#718096",
                                            fontWeight: 500,
                                            backgroundColor: "#f7fafc",
                                            padding: "4px 8px",
                                            borderRadius: 6
                                        }}>
                                            {bid.createdAt || bid.bidTime || bid.createTime ? 
                                                new Date(bid.createdAt || bid.bidTime || bid.createTime).toLocaleString('ko-KR', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : '시간 미상'
                                            }
                                        </div>
                                        <div style={{ 
                                            fontSize: 12, 
                                            color: "#a0aec0",
                                            fontWeight: 400
                                        }}>
                                            #{bids.length - index}번째 입찰
                                        </div>
                                        {/* 내 입찰 취소 버튼 */}
                                        {currentUser && (
                                            bid.bidderUserId === currentUser.id || 
                                            bid.userId === currentUser.id ||
                                            bid.bidUserNickname === currentUser.nickname ||
                                            bid.userNickname === currentUser.nickname
                                        ) && 
                                         (bid.status || bid.bidStatus) === 'BID' && 
                                         !auction.isWon && new Date(auction.endTime) >= new Date() && (
                                            <button
                                                onClick={() => handleCancelBid(bid)}
                                                style={{
                                                    padding: "6px 12px",
                                                    background: "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: 6,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    cursor: "pointer",
                                                    boxShadow: "0 2px 6px rgba(245, 101, 101, 0.3)",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onMouseOver={(e) => {
                                                    e.target.style.transform = "translateY(-1px)";
                                                    e.target.style.boxShadow = "0 4px 10px rgba(245, 101, 101, 0.4)";
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.transform = "translateY(0)";
                                                    e.target.style.boxShadow = "0 2px 6px rgba(245, 101, 101, 0.3)";
                                                }}
                                            >
                                                취소
                                            </button>
                                        )}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                        {hasMoreBids && (
                            <div style={{ 
                                padding: "16px 24px",
                                textAlign: "center",
                                borderTop: "1px solid #e2e8f0"
                            }}>
                                <button
                                    onClick={() => {
                                        const nextPage = bidPage + 1;
                                        setBidPage(nextPage);
                                        fetchBids(nextPage, false);
                                    }}
                                    style={{
                                        padding: "12px 24px",
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        border: "none",
                                        borderRadius: 20,
                                        cursor: "pointer",
                                        color: "white",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                                        transition: "all 0.2s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        margin: "0 auto"
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = "translateY(-2px)";
                                        e.target.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = "translateY(0)";
                                        e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                                    }}
                                >
                                    <span>📄</span>
                                    더 많은 입찰 보기
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                {/* 버튼 */}
                <div style={{ marginTop: 36 }}>
                    <button
                        style={{
                            background: "#eee",
                            color: "#333",
                            padding: "13px 24px",
                            borderRadius: 8,
                            fontWeight: 500,
                            fontSize: 17,
                            border: "none"
                        }}
                        onClick={() => navigate(-1)}
                    >
                        목록으로
                    </button>
                </div>

                {/* 에러 메시지 */}
                {errorMsg && <div style={{ color: "red", marginTop: 18 }}>{errorMsg}</div>}
            </div>
        </div>
    );
}
