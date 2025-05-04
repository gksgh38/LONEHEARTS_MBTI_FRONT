import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface KmbtiResult {
  type_code: string;
  type_name: string;
  result_json: string | KmbtiResultJson;
}

interface KmbtiResultJson {
  summary: string;
  keywords: string[];
  traits: { name: string; type: string; percent: number; desc: string }[];
  strengths: string[];
  watchouts: string[];
  relation_advice: { summary: string; guides: string[] };
  relation_style: { summary: string; styles: string[] };
  activity: { summary: string; activities: string[] };
}

const API_URL = process.env.REACT_APP_API_URL;

const ResultPage: React.FC = () => {
  const { resultType } = useParams<{ resultType: string }>();
  const [result, setResult] = useState<KmbtiResult | null>(null);
  const [parsed, setParsed] = useState<KmbtiResultJson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/kmbti-results/${resultType}`, { credentials: 'include' });
        if (!response.ok) throw new Error('결과를 찾을 수 없습니다');
        const data: KmbtiResult = await response.json();
        setResult(data);
        // result_json이 string이면 파싱
        let parsedJson: KmbtiResultJson | null = null;
        if (typeof data.result_json === 'string') {
          parsedJson = JSON.parse(data.result_json);
        } else {
          parsedJson = data.result_json;
        }
        setParsed(parsedJson);
      } catch (err) {
        setError(err instanceof Error ? err.message : '결과 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    if (resultType) {
      fetchResult();
    } else {
      setError('결과 유형이 지정되지 않았습니다.');
      setLoading(false);
    }
  }, [resultType]);

  if (loading) return <div>결과를 불러오는 중...</div>;
  if (error) return <div style={{ color: 'red' }}>오류: {error}</div>;
  if (!result || !parsed) return <div>결과 정보를 표시할 수 없습니다.</div>;

  return (
    <div style={{ backgroundColor: '#FFD700', padding: '40px 20px', textAlign: 'center', borderRadius: '8px', maxWidth: '800px', margin: '40px auto' }}>
      <h1 style={{ fontSize: '2.5em', margin: '10px 0', color: '#fff' }}>{result.type_name}</h1>
      <h2 style={{ fontSize: '1.3em', margin: '5px 0', color: '#555' }}>{result.type_code}</h2>
      <div style={{ margin: '18px 0' }}>
        {parsed.keywords.map(keyword => (
          <span key={keyword} style={{ display: 'inline-block', margin: '5px', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '15px', fontSize: '0.9em' }}>#{keyword}</span>
        ))}
      </div>
      <p style={{ margin: '18px 0', fontWeight: 'bold', color: '#333' }}>{parsed.summary}</p>
      <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: 600 }}>
        <h3>주요 특성</h3>
        <ul>
          {parsed.traits.map(trait => (
            <li key={trait.name}><b>{trait.name}</b> ({trait.type}, {trait.percent}%): {trait.desc}</li>
          ))}
        </ul>
        <h3>강점</h3>
        <ul>
          {parsed.strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <h3>주의점</h3>
        <ul>
          {parsed.watchouts.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
        <h3>관계 팁</h3>
        <div><b>{parsed.relation_advice.summary}</b></div>
        <ul>
          {parsed.relation_advice.guides.map((g, i) => <li key={i}>{g}</li>)}
        </ul>
        <h3>어울리는 관계 스타일</h3>
        <div><b>{parsed.relation_style.summary}</b></div>
        <ul>
          {parsed.relation_style.styles.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <h3>추천 활동</h3>
        <div><b>{parsed.activity.summary}</b></div>
        <ul>
          {parsed.activity.activities.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default ResultPage;