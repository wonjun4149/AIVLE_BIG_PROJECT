import React, { useState, useEffect } from 'react';
import { getContracts } from './api/term';
import './ContractManagement.css';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const data = await getContracts();
        // 백엔드 응답이 createdAt 기준으로 정렬되지 않았다면 프론트에서 정렬
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setContracts(sortedData);
      } catch (err) {
        setError('계약서 목록을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  if (loading) {
    return <div className="contract-management-container"><h1>로딩 중...</h1></div>;
  }

  if (error) {
    return <div className="contract-management-container"><h1>{error}</h1></div>;
  }

  return (
    <div className="contract-management-container">
      <h1>계약서 관리</h1>
      <div className="contract-list">
        <div className="contract-list-header">
          <div className="header-item title">제목</div>
          <div className="header-item memo">수정메모</div>
          <div className="header-item date">생성일</div>
          <div className="header-item version">버전</div>
        </div>
        {contracts.length > 0 ? (
          contracts.map((contract) => (
            <div key={contract.id} className="contract-item">
              <div className="item-data title">{contract.title}</div>
              <div className="item-data memo">
                {contract.memo ? (
                  <span>{contract.memo}</span>
                ) : (
                  <span className="no-memo">수정메모 없음</span>
                )}
              </div>
              <div className="item-data date">{new Date(contract.createdAt).toLocaleDateString()}</div>
              <div className="item-data version">{contract.version}</div>
            </div>
          ))
        ) : (
          <div className="no-contracts">
            <p>생성된 계약서가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractManagement;
