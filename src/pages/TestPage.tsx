import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Question from '../components/Question.tsx';

// 질문 구조 정의
interface QuestionData {
  id: number;
  text: string;
}

// 답변 구조 정의
interface AnswerData {
  questionId: number;
  value: number; // 예: 1-5 (매우 동의 ~ 매우 비동의)
}

const TestPage: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [gender, setGender] = useState<string>(''); // 성별 선택 상태
  const [fetchError, setFetchError] = useState<boolean>(false);
  const navigate = useNavigate();

  const questionsPerPage = 6; // 페이지당 6개 질문
  const totalQuestions = 60; // 총 질문 수
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);
  const API_URL = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/questions?page=${currentPage}&limit=${questionsPerPage}`, { credentials: 'include' });
        if (!response.ok) throw new Error('질문을 불러오지 못했습니다.');
        const data = await response.json();
        setQuestions(data.questions);
        setFetchError(false);
      } catch (error) {
        console.error(error);
        setQuestions([]);
        setFetchError(true);
        alert('서버에서 질문을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      }
    };
    fetchQuestions();
  }, [currentPage]); // currentPage가 변경될 때 다시 가져오기

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(a => a.questionId === questionId);
      if (existingAnswerIndex > -1) {
        // 기존 답변 업데이트
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = { questionId, value };
        return updatedAnswers;
      } else {
        // 새 답변 추가
        return [...prevAnswers, { questionId, value }];
      }
    });
  };

  const handleNextPage = () => {
    // 현재 페이지의 질문 id 목록
    const pageQuestionIds = questions.map(q => q.id);
    // 현재 페이지에서 답변하지 않은 질문이 있는지 확인
    const unanswered = pageQuestionIds.some(
      id => !answers.find(a => a.questionId === id)
    );
    if (unanswered) {
      alert('모든 문항에 답변해 주세요.');
      return;
    }
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const handleSubmit = async () => {
    // 마지막 페이지 전체 답변 체크
    const allQuestionIds = Array.from({length: totalQuestions}, (_, i) => i + 1);
    const unanswered = allQuestionIds.some(
      id => !answers.find(a => a.questionId === id)
    );
    if (unanswered) {
      alert('모든 문항에 답변해 주세요.');
      return;
    }
    if (!gender) {
      alert('성별을 선택해주세요.');
      return;
    }

    console.log('답변 제출:', answers);
    console.log('선택된 성별:', gender);

    try {
      const response = await fetch(`${API_URL}/api/kmbti/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ answers, gender }),
      });

      if (!response.ok) {
        throw new Error('답변 제출 실패');
      }

      const result = await response.json();
      console.log('받은 결과:', result);

      navigate(`/result/${result.type_code}`);
    } catch (error) {
      console.error("테스트 제출 오류:", error);
      alert('결과 제출 중 오류가 발생했습니다.');
    }
  };

  const isLastPage = currentPage === totalPages;

  return (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  }}>
    {/* 타이틀, 안내문 복구 */}
    <div style={{ textAlign: 'center', margin: '40px 0 30px 0' }}>
      <h1 style={{ fontSize: '5rem', fontWeight: 'bold', marginBottom: '30px', letterSpacing: '-2px' }}>KMBTI</h1>
      <div style={{ fontSize: '1.35rem', fontWeight: 'bold' }}>
        우리의 문화와 정서에 맞는 질문들로 보다 정확히 자신의 성향을 찾아보세요.
      </div>
    </div>
    {fetchError ? (
      <div style={{ color: 'red', margin: '30px 0' }}>
        서버에서 질문을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.
      </div>
    ) : (
      <>
        {/* 이하 동일 */}
        <div className="questions-container" style={{ maxWidth: 1200, margin: '0 auto', marginTop: 60 }}>
          {questions.map((q, idx) => (
            <React.Fragment key={q.id}>
              <Question
                question={q}
                answerValue={answers.find(a => a.questionId === q.id)?.value}
                onAnswerChange={handleAnswerChange}
              />
              {/* 마지막 문항이면서 마지막 페이지일 때만 성별 선택 UI 표시 */}
              {isLastPage && idx === questions.length - 1 && (
                <div style={{ marginTop: 40, marginBottom: -40, textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: 18 }}>성별</div>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    style={{
                      width: 320,
                      height: 54,
                      fontSize: '1.3rem',
                      borderRadius: 8,
                      border: '1.5px solid #ddd',
                      padding: '0 18px',
                      marginBottom: 18,
                      textAlign: 'left'
                    }}
                  >
                    <option value="">성별 선택</option>
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                  </select>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* 네비게이션/결과 버튼 영역 */}
        <div
          className="navigation-buttons"
          style={{
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            minHeight: 70
          }}
        >
          {/* 다음으로 넘어가기 버튼: 항상 가운데 정렬 */}
          {!isLastPage && (
            <button
              onClick={handleNextPage}
              style={{
                background: '#0082CC',
                color: '#fff',
                border: 'none',
                borderRadius: '40px',
                padding: '18px 38px',
                fontSize: '1.5em',
                fontWeight: 'bold',
                cursor: 'pointer',
                margin: '0 auto',
                display: 'block',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
              }}
            >
              다음으로 넘어가기
            </button>
          )}

          {/* 마지막 페이지에서만 "테스트 결과 보기" 버튼 표시 */}
          {isLastPage && (
            <button
              onClick={handleSubmit}
              style={{
                padding: '14px 32px',
                fontSize: '1.2em',
                cursor: 'pointer',
                backgroundColor: '#FF7A5A',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                fontWeight: 'bold'
              }}
            >
              테스트 결과 보기
            </button>
          )}
        </div>
      </>
    )}
  </div>
  );
};

export default TestPage;