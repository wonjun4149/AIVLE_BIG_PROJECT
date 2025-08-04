// src/components/MainLayout.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { getUserPoints } from '../api/point';

// BroadcastChannel은 한 번만 생성되어야 하므로 컴포넌트 외부에 선언하거나 useMemo를 사용합니다.
const channel = new BroadcastChannel('point-channel');

const MainLayout = ({ user, authLoading }) => {
  const [userPoints, setUserPoints] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPoints = useCallback(async (showRefreshIndicator = false) => {
    if (!user) {
      setUserPoints(0);
      return;
    }
    if (showRefreshIndicator) setIsRefreshing(true);
    
    try {
      const pointData = await getUserPoints(user.uid);
      setUserPoints(pointData.amount || 0);
    } catch (error) {
      console.error("MainLayout에서 포인트 조회 실패:", error);
      setUserPoints(0);
    } finally {
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  }, [user]);

  // --- 탭 간 통신 로직 ---
  useEffect(() => {
    // 다른 탭에서 보낸 메시지를 수신하는 리스너
    const handleMessage = (event) => {
      if (event.data === 'points-updated') {
        console.log('다른 탭으로부터 포인트 업데이트 메시지 수신. 포인트를 새로고침합니다.');
        fetchPoints(); // 메시지를 받으면 포인트를 다시 조회
      }
    };

    channel.addEventListener('message', handleMessage);

    // 컴포넌트가 언마운트될 때 리스너를 정리하여 메모리 누수 방지
    return () => {
      channel.removeEventListener('message', handleMessage);
    };
  }, [fetchPoints]); // fetchPoints가 변경될 때만 리스너를 새로 설정

  // 포인트를 새로고침하고, 다른 탭에도 알리는 함수
  const refreshPointsAndNotify = useCallback(async () => {
    await fetchPoints(true); // 현재 탭 새로고침
    console.log('현재 탭에서 포인트 변경 발생. 다른 탭에 메시지를 보냅니다.');
    channel.postMessage('points-updated'); // 다른 탭에 메시지 방송
  }, [fetchPoints]);
  
  // --- 로직 끝 ---

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  return (
    <div>
      <Navbar 
        user={user} 
        userPoints={userPoints} 
        isRefreshing={isRefreshing}
        onRefreshPoints={() => fetchPoints(true)} 
      />
      <main>
        {/* PointPage 등 하위 컴포넌트에는 알림 기능이 포함된 함수를 전달 */}
        <Outlet context={{ user, authLoading, refreshPoints: refreshPointsAndNotify }} />
      </main>
    </div>
  );
};

export default MainLayout;
