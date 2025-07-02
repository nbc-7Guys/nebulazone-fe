import React, { useEffect, useState, useCallback } from 'react';
import { getBans, deleteBan } from '../../services/api/bans';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../ui/Button';

const BanList = () => {
  console.log('BanList component rendered');
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchBans = useCallback(async () => {
    console.log('fetchBans called');
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting to call getBans()');
      const data = await getBans();
      console.log('Type of data from getBans():', typeof data);
      console.log('Data from getBans():', data);
      setBans(data);
      console.log('getBans() successful, data set to state');
    } catch (err) {
      console.error('Error in fetchBans:', err);
      setError(err.message || '제재 목록을 불러오는데 실패했습니다.');
      toast.error('제재 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBans();
  }, [fetchBans]);

  const handleDelete = async (ipAddress) => {
    if (window.confirm(`${ipAddress} IP 주소의 제재를 해제하시겠습니까?`)) {
      try {
        await deleteBan(ipAddress);
        toast.success(`${ipAddress} IP 주소의 제재가 해제되었습니다.`);
        fetchBans(); // 목록 새로고침
      } catch (err) {
        toast.error(`제재 해제에 실패했습니다: ${err.message}`);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {bans.length === 0 ? (
        <p className="text-center text-gray-500">현재 제재된 IP 주소가 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP 주소</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">공격 유형</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사유</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">만료 일시</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bans.map((ban) => (
                <tr key={ban.ipAddress}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ban.ipAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ban.attackType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ban.reason || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ban.expiresAt || '영구'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      onClick={() => handleDelete(ban.ipAddress)}
                      className="text-red-600 hover:text-red-900"
                    >
                      해제
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BanList;
