import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// 결과 상세 정보 구조 정의 (백엔드에서 가져오거나 미리 정의됨)
interface ResultDetails {
    title: string; // 예: "연예인"
    typeCode: string; // 예: "ESFP-T"
    description: string; // 더 긴 설명 (사용 가능한 경우)
    keywords: string[]; // 예: ["#논리중심", "#긍정감각"]
    imageUrl?: string; // 디자인 기반의 선택적 이미지 URL
}

const API_URL = process.env.REACT_APP_API_URL;

const ResultPage: React.FC = () => {
  const { resultType } = useParams<{ resultType: string }>(); // URL에서 유형 가져오기
  const [resultDetails, setResultDetails] = useState<ResultDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResultDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/results/${resultType}`);
        if (!response.ok) throw new Error('결과를 찾을 수 없습니다');
        const data: ResultDetails = await response.json();
        setResultDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '결과 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (resultType) {
      fetchResultDetails();
    } else {
      setError('결과 유형이 지정되지 않았습니다.');
      setLoading(false);
    }
  }, [resultType]); // resultType이 변경되면 다시 가져오기

  if (loading) {
    return <div>결과를 불러오는 중...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>오류: {error}</div>;
  }

  if (!resultDetails) {
    return <div>결과 정보를 표시할 수 없습니다.</div>;
  }

  // 이미지 기반 기본 스타일링
  const resultStyle: React.CSSProperties = {
      backgroundColor: '#FFD700', // 예시 노란색 배경
      padding: '40px 20px',
      textAlign: 'center',
      borderRadius: '8px',
      maxWidth: '800px',
      margin: '40px auto' // 결과 블록 가운데 정렬
  };

  const keywordStyle: React.CSSProperties = {
      display: 'inline-block',
      margin: '5px',
      padding: '5px 10px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)', // 반투명 흰색
      borderRadius: '15px',
      fontSize: '0.9em'
  };

  return (
    <div style={resultStyle}>
      <p style={{ color: '#fff' }}>여러분의 성격 유형:</p>
      <h1 style={{ fontSize: '3em', margin: '10px 0', color: '#fff' }}>{resultDetails.title}</h1>
      <h2 style={{ fontSize: '1.5em', margin: '5px 0', color: '#555' }}>{resultDetails.typeCode}</h2>
      <div>
        {resultDetails.keywords.map(keyword => (
          <span key={keyword} style={keywordStyle}>{keyword}</span>
        ))}
      </div>
      {resultDetails.imageUrl && (
          <img
            src={resultDetails.imageUrl}
            alt={resultDetails.title}
            style={{ maxWidth: '80%', height: 'auto', marginTop: '30px', borderRadius: '8px' }}
          />
      )}
      <p style={{ marginTop: '20px', textAlign: 'left', color: '#333' }}>
        {resultDetails.description}
      </p>
      {/* 필요한 경우 공유, 테스트 다시하기 등 버튼 추가 */}
      <div style={{ marginTop: 32, color: '#888', fontSize: '1.1em' }}>
        (현재실제분석로직X)
      </div>
    </div>
  );
};

export default ResultPage;