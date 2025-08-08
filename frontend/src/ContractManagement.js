import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getContracts } from './api/term';
import LoadingSpinner from './components/LoadingSpinner'; // 스피너 컴포넌트 import
import './ContractManagement.css';

const ContractManagement = () => {
  const { user, authLoading } = useOutletContext();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 인증 정보 로딩이 끝나고, 유저 정보가 있을 때만 API를 호출
    if (!authLoading && user) {
      const fetchContracts = async () => {
        try {
          setLoading(true); // API 호출 시작 시 로딩 상태로 설정
          const data = await getContracts();
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
    } else if (!authLoading && !user) {
      // 로딩이 끝났는데 유저가 없는 경우 (로그아웃 상태)
      setError('로그인이 필요합니다.');
      setLoading(false);
    }
  }, [user, authLoading]); // user와 authLoading 상태가 변경될 때마다 이 effect를 재실행

  // authLoading 또는 데이터 로딩 중일 때 스피너를 표시
  if (authLoading || loading) {
    return <LoadingSpinner />;
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
