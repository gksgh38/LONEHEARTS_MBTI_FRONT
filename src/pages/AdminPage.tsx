import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../App.tsx';
import { useNavigate } from 'react-router-dom';

const API_URL = (process.env.REACT_APP_API_URL as string) || '';

interface QuestionData {
  id: number;
  text: string;
  is_reverse: boolean;
}

const TABS = [
  { key: 'questions', label: '검사문항관리' },
  { key: 'criteria', label: '검사기준치관리' },
  { key: 'results', label: '검사결과문구관리' },
];

const AdminPage = () => {
  // 모든 Hook 선언을 최상단에 위치시킴
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveMessage, setSaveMessage] = useState('');
  // 그룹 정보 정의
  const GROUPS = [
    { key: 'A', name: '외향성' },
    { key: 'B', name: '계획성과 즉흥성' },
    { key: 'C', name: '사회성' },
    { key: 'D', name: '시간관점' },
    { key: 'E', name: '도전성과 창의성' },
    { key: 'F', name: '감정민감도' },
    { key: 'G', name: '이성관계' },
    { key: 'H', name: '공감성' },
    { key: 'I', name: '현실 인지' },
    { key: 'J', name: '자존감' },
  ];
  // 점수분포(기준치) 관리 상태 및 핸들러
  interface ScoreDistData {
    kmbti_type_name: string;
    kmbti_code: string;
    score_A_min: number; score_A_max: number;
    score_B_min: number; score_B_max: number;
    score_C_min: number; score_C_max: number;
    score_D_min: number; score_D_max: number;
    score_E_min: number; score_E_max: number;
    score_F_min: number; score_F_max: number;
    score_G_min: number; score_G_max: number;
    score_H_min: number; score_H_max: number;
    score_I_min: number; score_I_max: number;
    score_J_min: number; score_J_max: number;
  }
  const [scoreDistList, setScoreDistList] = useState([] as ScoreDistData[]);
  const [scoreDistLoading, setScoreDistLoading] = useState(false);
  const [scoreDistError, setScoreDistError] = useState('');
  const [editingType, setEditingType] = useState<string | null>(null);
  const [newScoreDist, setNewScoreDist] = useState<ScoreDistData>({
    kmbti_type_name: '', kmbti_code: '',
    score_A_min: 0, score_A_max: 0,
    score_B_min: 0, score_B_max: 0,
    score_C_min: 0, score_C_max: 0,
    score_D_min: 0, score_D_max: 0,
    score_E_min: 0, score_E_max: 0,
    score_F_min: 0, score_F_max: 0,
    score_G_min: 0, score_G_max: 0,
    score_H_min: 0, score_H_max: 0,
    score_I_min: 0, score_I_max: 0,
    score_J_min: 0, score_J_max: 0
  });
  const [editScoreDist, setEditScoreDist] = useState<ScoreDistData>({
    kmbti_type_name: '', kmbti_code: '',
    score_A_min: 0, score_A_max: 0,
    score_B_min: 0, score_B_max: 0,
    score_C_min: 0, score_C_max: 0,
    score_D_min: 0, score_D_max: 0,
    score_E_min: 0, score_E_max: 0,
    score_F_min: 0, score_F_max: 0,
    score_G_min: 0, score_G_max: 0,
    score_H_min: 0, score_H_max: 0,
    score_I_min: 0, score_I_max: 0,
    score_J_min: 0, score_J_max: 0
  });

  // KMBTI 결과(문구) 관리 상태 및 핸들러
  interface KmbtiResultMeta {
    type_code: string;
    type_name: string;
  }
  const [resultTypeList, setResultTypeList] = useState([] as KmbtiResultMeta[]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedResult, setSelectedResult] = useState<{ type_code: string; type_name: string; result_json: string } | null>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState('');
  const [editValue, setEditValue] = useState('');

  // 타입 목록만 조회
  useEffect(() => {
    if (activeTab !== 'results') return;
    setResultTypeList([]);
    setSelectedType('');
    setSelectedResult(null);
    setResultLoading(true);
    setResultError('');
    fetch(`${API_URL}/api/admin/kmbti-results`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setResultTypeList(data.map((d: any) => ({ type_code: d.type_code, type_name: d.type_name })));
        setResultLoading(false);
      })
      .catch(() => {
        setResultError('타입 목록을 불러오지 못했습니다.');
        setResultLoading(false);
      });
  }, [activeTab]);

  // 타입 선택 시 해당 데이터 fetch
  useEffect(() => {
    if (!selectedType) { setSelectedResult(null); setEditValue(''); return; }
    setResultLoading(true);
    setResultError('');
    fetch(`${API_URL}/api/kmbti-results/` + encodeURIComponent(selectedType), { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setSelectedResult({ type_code: data.type_code, type_name: data.type_name, result_json: typeof data.result_json === 'string' ? data.result_json : JSON.stringify(data.result_json, null, 2) });
        setEditValue(typeof data.result_json === 'string' ? data.result_json : JSON.stringify(data.result_json, null, 2));
        setResultLoading(false);
      })
      .catch(() => {
        setResultError('결과 데이터를 불러오지 못했습니다.');
        setSelectedResult(null);
        setEditValue('');
        setResultLoading(false);
      });
  }, [selectedType]);

  const handleSaveResultValue = async () => {
    if (!selectedResult) return;
    try {
      // 저장 시에만 빈 줄 무시
      const parsedToSave = JSON.parse(editValue);
      ['keywords', 'strengths', 'watchouts'].forEach(key => {
        if (Array.isArray(parsedToSave[key])) {
          parsedToSave[key] = parsedToSave[key].filter((v: string) => v.trim() !== '');
        }
      });
      if (parsedToSave.relation_advice && Array.isArray(parsedToSave.relation_advice.guides)) {
        parsedToSave.relation_advice.guides = parsedToSave.relation_advice.guides.filter((v: string) => v.trim() !== '');
      }
      if (parsedToSave.relation_style && Array.isArray(parsedToSave.relation_style.styles)) {
        parsedToSave.relation_style.styles = parsedToSave.relation_style.styles.filter((v: string) => v.trim() !== '');
      }
      if (parsedToSave.activity && Array.isArray(parsedToSave.activity.activities)) {
        parsedToSave.activity.activities = parsedToSave.activity.activities.filter((v: string) => v.trim() !== '');
      }    
      if (parsedToSave.relation_advice && Array.isArray(parsedToSave.relation_advice.guides)) {
        parsedToSave.relation_advice.guides = parsedToSave.relation_advice.guides.filter((v: string) => v.trim() !== '');
      }
      if (parsedToSave.relation_style && Array.isArray(parsedToSave.relation_style.styles)) {
        parsedToSave.relation_style.styles = parsedToSave.relation_style.styles.filter((v: string) => v.trim() !== '');
      }
      if (parsedToSave.activity && Array.isArray(parsedToSave.activity.activities)) {
        parsedToSave.activity.activities = parsedToSave.activity.activities.filter((v: string) => v.trim() !== '');
      }
      const res = await fetch(`${API_URL}/api/admin/kmbti-results/` + encodeURIComponent(selectedResult.type_code), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type_name: selectedResult.type_name, result_json: JSON.stringify(parsedToSave) })
      });
      if (!res.ok) throw new Error();
      alert('저장되었습니다.');
    } catch {
      alert('저장 실패');
    }
  };

  useEffect(() => {
    if (activeTab !== 'questions') return;
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/questions?page=1&limit=60`, { credentials: 'include' });
        if (!response.ok) throw new Error('문항을 불러오지 못했습니다.');
        const data = await response.json();
        setQuestions(data.questions);
        setFetchError(false);
      } catch (e) {
        setQuestions([]);
        setFetchError(true);
      }
    };
    fetchQuestions();
  }, [activeTab]);

  const handleChange = (id: number, value: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, text: value } : q));
  };
  const handleReverseChange = (id: number, checked: boolean) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, is_reverse: checked } : q));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveMessage('');
    try {
      const res = await fetch(`${API_URL}/api/admin/update-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ questions })
      });
      if (!res.ok) throw new Error('저장 실패');
      setSaveStatus('success');
      setSaveMessage('저장 완료!');
      window.alert('저장 완료!');
    } catch {
      setSaveStatus('error');
      setSaveMessage('저장 실패');
      window.alert('저장 실패');
    }
  };

  // 점수분포 목록 조회
  useEffect(() => {
    if (activeTab !== 'criteria') return;
    setScoreDistLoading(true);
    setScoreDistError('');
    fetch(`${API_URL}/api/admin/kmbti-score-distributions`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setScoreDistList(data);
        setScoreDistLoading(false);
      })
      .catch(() => {
        setScoreDistError('점수분포 목록을 불러오지 못했습니다.');
        setScoreDistLoading(false);
      });
  }, [activeTab]);

  // 점수분포 추가
  const handleAddScoreDist = async () => {
    if (!newScoreDist.kmbti_type_name || !newScoreDist.kmbti_code) return alert('유형명과 코드를 입력하세요.');
    try {
      const res = await fetch(`${API_URL}/api/admin/kmbti-score-distributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newScoreDist)
      });
      if (!res.ok) throw new Error();
      setNewScoreDist({ kmbti_type_name: '', kmbti_code: '', score_A_min: 0, score_A_max: 0, score_B_min: 0, score_B_max: 0, score_C_min: 0, score_C_max: 0, score_D_min: 0, score_D_max: 0, score_E_min: 0, score_E_max: 0, score_F_min: 0, score_F_max: 0, score_G_min: 0, score_G_max: 0, score_H_min: 0, score_H_max: 0, score_I_min: 0, score_I_max: 0, score_J_min: 0, score_J_max: 0 });
      // 새로고침
      const listRes = await fetch(`${API_URL}/api/admin/kmbti-score-distributions`, { credentials: 'include' });
      setScoreDistList(await listRes.json());
    } catch {
      alert('추가 실패');
    }
  };

  // 점수분포 삭제
  const handleDeleteScoreDist = async (kmbti_type_name: string, kmbti_code: string) => {
    if (!window.confirm(`정말 삭제하시겠습니까? (유형명: ${kmbti_type_name}, 코드: ${kmbti_code})`)) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/kmbti-score-distributions/` + encodeURIComponent(kmbti_type_name), { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      setScoreDistList(list => list.filter(c => c.kmbti_type_name !== kmbti_type_name));
    } catch {
      alert('삭제 실패');
    }
  };

  // 점수분포 수정 시작
  const startEditScoreDist = (c: ScoreDistData) => {
    setEditingType(c.kmbti_type_name);
    setEditScoreDist({ ...c });
  };
  // 점수분포 수정 취소
  const cancelEditScoreDist = () => {
    setEditingType(null);
    setEditScoreDist({ kmbti_type_name: '', kmbti_code: '', score_A_min: 0, score_A_max: 0, score_B_min: 0, score_B_max: 0, score_C_min: 0, score_C_max: 0, score_D_min: 0, score_D_max: 0, score_E_min: 0, score_E_max: 0, score_F_min: 0, score_F_max: 0, score_G_min: 0, score_G_max: 0, score_H_min: 0, score_H_max: 0, score_I_min: 0, score_I_max: 0, score_J_min: 0, score_J_max: 0 });
  };
  // 점수분포 수정 저장
  const handleSaveEditScoreDist = async (kmbti_type_name: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/kmbti-score-distributions/` + encodeURIComponent(kmbti_type_name), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editScoreDist)
      });
      if (!res.ok) throw new Error();
      setEditingType(null);
      // 새로고침
      const listRes = await fetch(`${API_URL}/api/admin/kmbti-score-distributions`, { credentials: 'include' });
      setScoreDistList(await listRes.json());
    } catch {
      alert('수정 실패');
    }
  };

  // user 정보가 아직 로딩 중일 때는 아무것도 렌더링하지 않음
  if (user === undefined || user === null) {
    return null;
  }

  if (!user.isAdmin) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100, fontSize: '1.5rem', color: 'red' }}>
        관리자만 접근할 수 있습니다.<br />
        <button onClick={() => navigate('/')} style={{ marginTop: 24, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#0082CC', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          메인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', minWidth: '1200px', margin: '60px auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 32, textAlign: 'center' }}>관리자 페이지</h1>
      {/* 탭 UI */}
      <div style={{ display: 'flex', justifyContent: 'center', borderBottom: '2px solid #eee', marginBottom: 32 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #0082CC' : '3px solid transparent',
              color: activeTab === tab.key ? '#0082CC' : '#888',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              fontSize: '1.1em',
              padding: '12px 48px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'color 0.2s, border-bottom 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* 탭별 내용 */}
      {activeTab === 'questions' && (
        fetchError ? (
          <div style={{ color: 'red', marginTop: 40 }}>문항을 불러오지 못했습니다.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ maxHeight: 600, overflowY: 'auto', marginBottom: 24, width: '80%' }}>
              {GROUPS.map((group, groupIdx) => {
                const groupQuestions = questions.slice(groupIdx * 6, groupIdx * 6 + 6);
                return (
                  <div key={group.key} style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #eee' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: 6 }}>
                      {group.key}. {group.name}
                    </div>
                    {groupQuestions.map((q, idx) => (
                      <div key={q.id} style={{ marginBottom: 18, display: 'flex', alignItems: 'center' }}>
                        <label style={{ fontWeight: 'bold', marginRight: 12 }}>문항 {group.key}{idx + 1}</label>
                        <input
                          type="text"
                          value={q.text}
                          onChange={e => handleChange(q.id, e.target.value)}
                          style={{ width: '70%', padding: 8, fontSize: '1em', borderRadius: 6, border: '1px solid #ccc', marginRight: 12 }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.98em', marginLeft: 8 }}>
                          <input
                            type="checkbox"
                            checked={q.is_reverse}
                            onChange={e => handleReverseChange(q.id, e.target.checked)}
                            style={{ marginRight: 4 }}
                          />
                          역채점
                        </label>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
              <button
                onClick={handleSave}
                style={{ padding: '12px 32px', fontSize: '1.1em', borderRadius: 8, background: '#0082CC', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                저장
              </button>
            </div>
          </div>
        )
      )}
      {activeTab === 'criteria' && (
        <div>
          <h2 style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: 16 }}>KMBTI 점수분포(기준치) 목록</h2>
          {scoreDistLoading ? (
            <div style={{ color: '#888', margin: 32 }}>불러오는 중...</div>
          ) : scoreDistError ? (
            <div style={{ color: 'red', margin: 32 }}>{scoreDistError}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: '0.97em', textAlign: 'center' }}>
              <thead>
                <tr style={{ background: '#f8f8f8' }}>
                  <th style={{ border: '1px solid #eee', padding: 6, minWidth: 120 }}>유형명</th>
                  <th style={{ border: '1px solid #eee', padding: 6, minWidth: 90 }}>코드</th>
                  {['A','B','C','D','E','F','G','H','I','J'].map(key => (
                    <th key={key} style={{ border: '1px solid #eee', padding: 6 }}>{key}</th>
                  ))}
                  <th style={{ border: '1px solid #eee', padding: 6, minWidth: 140 }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {scoreDistList.map(c => editingType === c.kmbti_type_name ? (
                  <tr key={c.kmbti_type_name} style={{ background: '#f3faff' }}>
                    <td style={{ border: '1px solid #eee', padding: 6 }}>
                      <input value={editScoreDist.kmbti_type_name} onChange={e => setEditScoreDist(ec => ({ ...ec, kmbti_type_name: e.target.value }))} style={{ width: 110, textAlign: 'center' }} />
                    </td>
                    <td style={{ border: '1px solid #eee', padding: 6 }}>
                      <input value={editScoreDist.kmbti_code} onChange={e => setEditScoreDist(ec => ({ ...ec, kmbti_code: e.target.value }))} style={{ width: 80, textAlign: 'center' }} />
                    </td>
                    {['A','B','C','D','E','F','G','H','I','J'].map(key => (
                      <td key={key} style={{ border: '1px solid #eee', padding: 6 }}>
                        <input type="number" value={editScoreDist[`score_${key}_min` as keyof ScoreDistData] as number} onChange={e => setEditScoreDist(ec => ({ ...ec, [`score_${key}_min`]: Number(e.target.value) }))} style={{ width: 40, textAlign: 'center' }} />
                        <span style={{ margin: '0 4px' }}>~</span>
                        <input type="number" value={editScoreDist[`score_${key}_max` as keyof ScoreDistData] as number} onChange={e => setEditScoreDist(ec => ({ ...ec, [`score_${key}_max`]: Number(e.target.value) }))} style={{ width: 40, textAlign: 'center' }} />
                      </td>
                    ))}
                    <td style={{ border: '1px solid #eee', padding: 6, minWidth: 140, display: 'flex', justifyContent: 'center', gap: 8 }}>
                      <button onClick={() => handleSaveEditScoreDist(c.kmbti_type_name)} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#0082CC', color: '#fff', fontWeight: 'bold', cursor: 'pointer', minWidth: 80 }}>저장</button>
                      <button onClick={cancelEditScoreDist} style={{ padding: '6px 18px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', color: '#0082CC', fontWeight: 'bold', cursor: 'pointer', minWidth: 80 }}>취소</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.kmbti_type_name}>
                    <td style={{ border: '1px solid #eee', padding: 6, minWidth: 120 }}>{c.kmbti_type_name}</td>
                    <td style={{ border: '1px solid #eee', padding: 6, minWidth: 90 }}>{c.kmbti_code}</td>
                    {['A','B','C','D','E','F','G','H','I','J'].map(key => (
                      <td key={key} style={{ border: '1px solid #eee', padding: 6 }}>{c[`score_${key}_min` as keyof ScoreDistData]} ~ {c[`score_${key}_max` as keyof ScoreDistData]}</td>
                    ))}
                    <td style={{ border: '1px solid #eee', padding: 6, minWidth: 140, display: 'flex', justifyContent: 'center', gap: 8 }}>
                      <button onClick={() => startEditScoreDist(c)} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#0082CC', color: '#fff', fontWeight: 'bold', cursor: 'pointer', minWidth: 80 }}>수정</button>
                      <button onClick={() => handleDeleteScoreDist(c.kmbti_type_name, c.kmbti_code)} style={{ padding: '6px 18px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', color: '#0082CC', fontWeight: 'bold', cursor: 'pointer', minWidth: 80 }}>삭제</button>
                    </td>
                  </tr>
                ))}
                {/* 추가 폼 */}
                <tr style={{ background: '#f8f8f8' }}>
                  <td style={{ border: '1px solid #eee', padding: 6, height: 40 }}>
                    <input value={newScoreDist.kmbti_type_name} onChange={e => setNewScoreDist(nc => ({ ...nc, kmbti_type_name: e.target.value }))} style={{ width: 110, textAlign: 'center' }} />
                  </td>
                  <td style={{ border: '1px solid #eee', padding: 6, height: 40 }}>
                    <input value={newScoreDist.kmbti_code} onChange={e => setNewScoreDist(nc => ({ ...nc, kmbti_code: e.target.value }))} style={{ width: 80, textAlign: 'center' }} />
                  </td>
                  {['A','B','C','D','E','F','G','H','I','J'].map(key => (
                    <td key={key} style={{ border: '1px solid #eee', padding: 6, height: 40 }}>
                      <input type="number" value={newScoreDist[`score_${key}_min` as keyof ScoreDistData] as number} onChange={e => setNewScoreDist(nc => ({ ...nc, [`score_${key}_min`]: Number(e.target.value) }))} style={{ width: 40, textAlign: 'center' }} />
                      <span style={{ margin: '0 4px' }}>~</span>
                      <input type="number" value={newScoreDist[`score_${key}_max` as keyof ScoreDistData] as number} onChange={e => setNewScoreDist(nc => ({ ...nc, [`score_${key}_max`]: Number(e.target.value) }))} style={{ width: 40, textAlign: 'center' }} />
                    </td>
                  ))}
                  <td style={{ border: '1px solid #eee', padding: 6, minWidth: 140, display: 'flex', justifyContent: 'center', height: 40 }}>
                    <button onClick={handleAddScoreDist} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#0082CC', color: '#fff', fontWeight: 'bold', cursor: 'pointer', minWidth: 80 }}>추가</button>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
      {activeTab === 'results' && (
        <div>
          <h2 style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: 16 }}>KMBTI 결과(문구) 관리</h2>
          {resultLoading && <div style={{ color: '#888', margin: 32 }}>불러오는 중...</div>}
          {resultError && <div style={{ color: 'red', margin: 32 }}>{resultError}</div>}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 'bold', marginRight: 12 }}>KMBTI 타입 선택:</label>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ padding: '6px 16px', fontSize: '1em', borderRadius: 6, border: '1px solid #ccc', minWidth: 180 }}>
              <option value="">-- 선택 --</option>
              {resultTypeList.map(t => (
                <option key={t.type_code} value={t.type_code}>{t.type_name} ({t.type_code})</option>
              ))}
            </select>
          </div>
          {selectedResult && (() => {
            let parsed: Record<string, any> = {};
            try {
              parsed = JSON.parse(editValue);
            } catch {
              return <div style={{ color: 'red' }}>JSON 파싱 오류: 올바른 JSON 형식이 아닙니다.</div>;
            }
            // traits 배열 관리
            const handleTraitChange = (idx: number, key: string, value: string) => {
              const newTraits = parsed.traits.map((t: any, i: number) => i === idx ? { ...t, [key]: key === 'percent' ? Number(value) : value } : t);
              const newObj = { ...parsed, traits: newTraits };
              setEditValue(JSON.stringify(newObj, null, 2));
            };
            // 배열 항목 관리
            const handleArrayChange = (key: string, value: string) => {
              // 줄 추가(엔터) 시 textarea에는 빈 줄도 보이게 하고, 저장 시에만 빈 줄 무시
              const arr = value.split(/\r?\n/);
              const newObj = { ...parsed, [key]: arr };
              setEditValue(JSON.stringify(newObj, null, 2));
            };
            // 중첩 배열 항목 관리 (예: activity.activities, relation_style.styles, relation_advice.guides)
            const handleNestedArrayChange = (parent: string, key: string, value: string) => {
              // 줄 추가(엔터) 시 textarea에는 빈 줄도 보이게 하고, 저장 시에만 빈 줄 무시
              const arr = value.split(/\r?\n/);
              const newObj = { ...parsed, [parent]: { ...parsed[parent], [key]: arr } };
              setEditValue(JSON.stringify(newObj, null, 2));
            };
            // 중첩 summary 관리
            const handleNestedSummaryChange = (parent: string, value: string) => {
              const newObj = { ...parsed, [parent]: { ...parsed[parent], summary: value } };
              setEditValue(JSON.stringify(newObj, null, 2));
            };
            return (
              <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 12, fontWeight: 'bold' }}>{selectedResult.type_name} ({selectedResult.type_code})</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: '0.97em' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #eee', padding: 8, width: 220, fontWeight: 'bold', background: '#f8f8f8', whiteSpace: 'nowrap' }}>한줄 요약</td>
                      <td style={{ border: '1px solid #eee', padding: 8 }}>
                        <textarea value={parsed.summary || ''} onChange={e => setEditValue(JSON.stringify({ ...parsed, summary: e.target.value }, null, 2))} style={{ width: '100%', minHeight: 40, padding: 6, fontSize: '1em', borderRadius: 6, border: '1px solid #ccc' }} spellCheck={false} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #eee', padding: 8, width: 220, fontWeight: 'bold', background: '#f8f8f8', whiteSpace: 'nowrap' }}>키워드</td>
                      <td style={{ border: '1px solid #eee', padding: 8 }}>
                        <textarea value={(parsed.keywords || []).join('\n')} onChange={e => handleArrayChange('keywords', e.target.value)} style={{ width: '100%', minHeight: 88, height: 88, padding: 6, fontSize: '1em', borderRadius: 6, border: '1px solid #ccc' }} placeholder="줄바꿈으로 구분" spellCheck={false} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #eee', padding: 8, width: 220, fontWeight: 'bold', background: '#f8f8f8', whiteSpace: 'nowrap' }}>주요 특성(성향)</td>
                      <td style={{ border: '1px solid #eee', padding: 8 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.96em' }}>
                          <thead>
                            <tr>
                              <th style={{ border: '1px solid #eee', padding: 4, background: '#f0f0f0', width: 90 }}>이름</th>
                              <th style={{ border: '1px solid #eee', padding: 4, background: '#f0f0f0', width: 90 }}>유형</th>
                              <th style={{ border: '1px solid #eee', padding: 4, background: '#f0f0f0', width: 60 }}>%</th>
                              <th style={{ border: '1px solid #eee', padding: 4, background: '#f0f0f0' }}>설명</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(parsed.traits || []).map((trait: any, idx: number) => (
                              <tr key={idx}>
                                <td style={{ border: '1px solid #eee', padding: 4, width: 90 }}>
                                  <input value={trait.name} disabled style={{ width: '100%', padding: 2, background: '#f5f5f5', color: '#888' }} />
                                </td>
                                <td style={{ border: '1px solid #eee', padding: 4, width: 90 }}>
                                  <input value={trait.type} onChange={e => handleTraitChange(idx, 'type', e.target.value)} style={{ width: '100%', padding: 2 }} />
                                </td>
                                <td style={{ border: '1px solid #eee', padding: 4, width: 60 }}>
                                  <input type="number" value={trait.percent} onChange={e => handleTraitChange(idx, 'percent', e.target.value)} style={{ width: '100%', padding: 2 }} />
                                </td>
                                <td style={{ border: '1px solid #eee', padding: 4 }}>
                                  <input value={trait.desc} onChange={e => handleTraitChange(idx, 'desc', e.target.value)} style={{ width: '100%', padding: 2 }} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #eee', padding: 8, width: 220, fontWeight: 'bold', background: '#f8f8f8', whiteSpace: 'nowrap' }}>강점</td>
                      <td style={{ border: '1px solid #eee', padding: 8 }}>
                        <textarea value={(parsed.strengths || []).join('\n')} onChange={e => handleArrayChange('strengths', e.target.value)} style={{ width: '100%', minHeight: 88, height: 88, padding: 6, fontSize: '1em', borderRadius: 6, border: '1px solid #ccc' }} placeholder="줄바꿈으로 구분" spellCheck={false} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #eee', padding: 8, width: 220, fontWeight: 'bold', background: '#f8f8f8', whiteSpace: 'nowrap' }}>주의점</td>
                      <td style={{ border: '1px solid #eee', padding: 8 }}>
                        <textarea value={(parsed.watchouts || []).join('\n')} onChange={e => handleArrayChange('watchouts', e.target.value)} style={{ width: '100%', minHeight: 88, height: 88, padding: 6, fontSize: '1em', borderRadius: 6, border: '1px solid #ccc' }} placeholder="줄바꿈으로 구분" spellCheck={false} />
                      </td>
                    </tr>
                    {/* 순서: 관계팁, 관계스타일, 추천활동 */}
                    <tr>
                      <td style={{ border: '1px solid #eee', padding: 8, width: 220, fontWeight: 'bold', background: '#f8f8f8', whiteSpace: 'nowrap' }}>관계 팁 요약</td>
                      <td style={{ border: '1px solid #eee', padding: 8 }}>
                        <input value={parsed.relation_advice?.summary || ''} onChange={e => handleNestedSummaryChange('relation_advice', e.target.value)} style={{ width: '100%', padding: 6, fontSize: '1em', borderRadius: 6, border: '1px solid #ccc' }} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #eee', padding: 8, width: 220, fontWeight: 'bold', background: '#f8f8f8', whiteSpace: 'nowrap' }}>관계 팁</td>
                      <td style={{ border: '1px solid #eee', padding: 8 }}>
                        <textarea value={(parsed.relation_advice?.guides || []).join('\n')} onChange={e => handleNestedArrayChange('relation_advice', 'guides', e.target.value)} style={{ width: '100%', minHeight: 88, height: 88, padding: 6, fontSize: '1em', borderRadius: 6, border: '1px solid #ccc' }} placeholder="줄바꿈으로 구분" spellCheck={false} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #eee', padding: 8, width: 220, fontWeight: 'bold', background: '#f8f8f8', whiteSpace: 'nowrap' }}>어울리는 관계 스타일 요약</td>
                      <td style={{ border: '1px solid #eee', padding: 8 }}>
                        <input value={parsed.relation_style?.summary || ''} onChange={e => handleNestedSummaryChange('relation_style', e.target.value)} style={{ width: '100%', padding: 6, fontSize: '1em', borderRadius: 6, border: '1px solid #ccc' }} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #eee', padding: 8, width: 220, fontWeight: 'bold', background: '#f8f8f8', whiteSpace: 'nowrap' }}>어울리는 관계 스타일</td>
                      <td style={{ border: '1px solid #eee', padding: 8 }}>
                        <textarea value={(parsed.relation_style?.styles || []).join('\n')} onChange={e => handleNestedArrayChange('relation_style', 'styles', e.target.value)} style={{ width: '100%', minHeight: 88, height: 88, padding: 6, fontSize: '1em', borderRadius: 6, border: '1px solid #ccc' }} placeholder="줄바꿈으로 구분" spellCheck={false} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #eee', padding: 8, width: 220, fontWeight: 'bold', background: '#f8f8f8', whiteSpace: 'nowrap' }}>추천 활동 요약</td>
                      <td style={{ border: '1px solid #eee', padding: 8 }}>
                        <input value={parsed.activity?.summary || ''} onChange={e => handleNestedSummaryChange('activity', e.target.value)} style={{ width: '100%', padding: 6, fontSize: '1em', borderRadius: 6, border: '1px solid #ccc' }} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #eee', padding: 8, width: 220, fontWeight: 'bold', background: '#f8f8f8', whiteSpace: 'nowrap' }}>추천 활동</td>
                      <td style={{ border: '1px solid #eee', padding: 8 }}>
                        <textarea value={(parsed.activity?.activities || []).join('\n')} onChange={e => handleNestedArrayChange('activity', 'activities', e.target.value)} style={{ width: '100%', minHeight: 88, height: 88, padding: 6, fontSize: '1em', borderRadius: 6, border: '1px solid #ccc' }} placeholder="줄바꿈으로 구분" spellCheck={false} />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                  <button onClick={handleSaveResultValue} style={{ padding: '10px 32px', borderRadius: 8, background: '#0082CC', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05em' }}>저장</button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
