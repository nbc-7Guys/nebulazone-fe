import React from "react";

function CreateRoomPanel({createRoom, roomCreateResult}) {
    return (
        <>
            <button onClick={createRoom}>[구매자 전용] 채팅방 생성</button>
            <div id="roomCreateResult">{roomCreateResult}</div>
        </>
    );
}

export default CreateRoomPanel;
