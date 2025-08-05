import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { getUserPoints, chargeUserPoints } from '../api/point';
import './PointPage.css';

const PointPage = () => {
    const { user, authLoading, refreshPoints } = useOutletContext();
    const navigate = useNavigate();
    const [points, setPoints] = useState(0);
    const [loadingPoints, setLoadingPoints] = useState(true);
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [isCharging, setIsCharging] = useState(false);

    // 알림이 중복으로 뜨는 것을 방지하기 위한 ref
    const alertShown = useRef(false);

    const predefinedAmounts = [5000, 10000, 50000, 100000, 500000];

    const fetchCurrentPoints = async () => {
        if (!user) return;
        setLoadingPoints(true);
        try {
            const pointData = await getUserPoints(user.uid);
            setPoints(pointData.amount || 0);
        } catch (error) {
            console.error("포인트 조회 실패", error);
        } finally {
            setLoadingPoints(false);
        }
    };

    useEffect(() => {
        // 인증 상태 로딩이 끝났을 때만 로직 실행
        if (!authLoading) {
            if (!user) {
                // ref를 확인하여 알림이 아직 표시되지 않았을 때만 실행
                if (!alertShown.current) {
                    alert('로그인이 필요한 페이지입니다.');
                    alertShown.current = true; // 알림이 표시되었음을 기록
                    navigate('/login');
                }
            } else {
                fetchCurrentPoints();
            }
        }
    }, [user, authLoading, navigate]);

    const handleAmountClick = (amount) => {
        setSelectedAmount(amount);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value.replace(/,/g, '');
        if (/^\d*$/.test(value)) {
            setCustomAmount(Number(value).toLocaleString());
            setSelectedAmount(Number(value));
        }
    };

    const handleCharge = async () => {
        if (!selectedAmount || selectedAmount <= 0) {
            alert('충전할 금액을 선택해주세요.');
            return;
        }
        if (!paymentMethod) {
            alert('결제 수단을 선택해주세요.');
            return;
        }

        setIsCharging(true);
        try {
            await chargeUserPoints(user.uid, selectedAmount);
            alert(`${selectedAmount.toLocaleString()}P가 성공적으로 충전되었습니다.`);
            
            await refreshPoints();
            await fetchCurrentPoints();

            setSelectedAmount(null);
            setCustomAmount('');
            setPaymentMethod(null);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsCharging(false);
        }
    };

    if (authLoading || !user) {
        return <div className="loading-container">페이지를 불러오는 중...</div>;
    }

    return (
        <div className="point-page-container">
            <h1 className="point-page-title">포인트 관리</h1>

            <div className="point-card current-points">
                <h2>나의 보유 포인트</h2>
                <p>{loadingPoints ? '조회 중...' : `${points.toLocaleString()} P`}</p>
            </div>

            <div className="point-card charge-section">
                <h2>포인트 충전</h2>
                <div className="amount-selector">
                    {predefinedAmounts.map(amount => (
                        <button
                            key={amount}
                            className={`amount-btn ${selectedAmount === amount && customAmount === '' ? 'selected' : ''}`}
                            onClick={() => handleAmountClick(amount)}
                        >
                            {amount.toLocaleString()}원
                        </button>
                    ))}
                    <input
                        type="text"
                        className="amount-input"
                        placeholder="직접 입력"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                    />
                </div>
            </div>

            <div className="point-card payment-method">
                <h2>결제 수단</h2>
                <div className="payment-icons">
                    <div
                        className={`payment-icon ${paymentMethod === 'kakao' ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod('kakao')}
                    >
                        <span>카카오페이</span>
                    </div>
                    <div
                        className={`payment-icon ${paymentMethod === 'toss' ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod('toss')}
                    >
                        <span>토스</span>
                    </div>
                </div>
            </div>

            <button className="charge-submit-btn" onClick={handleCharge} disabled={isCharging}>
                {isCharging ? '충전 중...' : `${(selectedAmount || 0).toLocaleString()}P 충전하기`}
            </button>
        </div>
    );
};

export default PointPage;
