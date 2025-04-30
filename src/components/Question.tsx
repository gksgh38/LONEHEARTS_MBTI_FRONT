import React from 'react';

interface QuestionProps {
  question: {
    id: number;
    text: string;
  };
  answerValue?: number;
  onAnswerChange: (questionId: number, value: number) => void;
}

const Question: React.FC<QuestionProps> = ({ question, answerValue, onAnswerChange }) => {
  return (
    <div style={{ margin: '90px 0', padding: '0 0 40px 0' }}>
      {/* 질문 텍스트 */}
      <p
        style={{
          fontWeight: 'bold', // 볼드 처리 유지
          fontSize: '2rem',
          marginBottom: '32px',
          textAlign: 'center',
          letterSpacing: '-1px',
          wordBreak: 'keep-all',
          whiteSpace: 'normal',
          overflowWrap: 'break-word',
          maxWidth: '100%'
        }}
      >
        <strong>{question.text}</strong>
      </p>
      {/* 선택지 UI */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: 900,
          margin: '0 auto',
          padding: '32px 0',
          position: 'relative',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '1.5rem', marginRight: 56, minWidth: 120, textAlign: 'right', display: 'inline-block' }}>그렇다</span>
        <div style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 64,
          position: 'relative',
        }}>
          {[5, 4, 3, 2, 1].map((value, index) => {
            // 가운데(3번)가 가장 작고, 양끝(5,1)이 가장 큼
            const sizeArr = [64, 44, 28, 44, 64];
            const size = sizeArr[index];
            return (
              <label key={value} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                zIndex: 1
              }}>
                <span
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: answerValue === value ? '#28a745' : '#0a3dcc',
                    borderRadius: '50%',
                    display: 'inline-block',
                    border: answerValue === value ? '3px solid #28a745' : '3px solid transparent',
                    transition: 'background 0.2s, border 0.2s',
                  }}
                ></span>
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={value}
                  checked={answerValue === value}
                  onChange={() => onAnswerChange(question.id, value)}
                  style={{ display: 'none' }}
                />
              </label>
            );
          })}
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.5rem', marginLeft: 56, minWidth: 90, textAlign: 'left' }}>그렇지않다</span>
      </div>
    </div>
  );
};

export default Question;