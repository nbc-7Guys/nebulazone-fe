import React from "react";

function Pagination() {
    return (
        <div style={{ textAlign: "center", margin: "24px 0" }}>
            <button style={{ marginRight: 12 }}>{'<'}</button>
            {[1, 2, 3, 4, 5].map((n) =>
                <button key={n} style={{
                    margin: "0 5px",
                    fontWeight: n === 2 ? "bold" : undefined,
                    color: n === 2 ? "#38d39f" : "#222"
                }}>{n}</button>
            )}
            <button style={{ marginLeft: 12 }}>{'>'}</button>
        </div>
    );
}

export default Pagination;
