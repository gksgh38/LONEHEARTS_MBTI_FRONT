import React from 'react';

interface QuestionProps {
  question: {
    id: number;
    text: string;
  };
  questionNumber: number; // 문항 번호 추가
  answerValue?: number;
  onAnswerChange: (questionId: number, value: number) => void;
}

const Question: React.FC<QuestionProps> = ({ question, questionNumber, answerValue, onAnswerChange }) => {
  // 반응형: 모바일에서 width 100%, gap 축소, 폰트/버튼 크기 축소
  const isMobile = window.innerWidth <= 768;
  const optionGap = isMobile ? 24 : 64;
  const optionSizeArr = isMobile ? [40, 28, 18, 28, 40] : [64, 44, 28, 44, 64];
  const labelFontSize = isMobile ? '1.1rem' : '1.5rem';
  const labelMinWidthLeft = isMobile ? 60 : 120;
  const labelMinWidthRight = isMobile ? 50 : 90;
  const questionFontSize = isMobile ? '1.2rem' : '2rem';

  return (
    <div style={{ margin: '90px 0', padding: '0 0 40px 0' }}>
      {/* 질문 텍스트 */}
      <p
        style={{
          fontWeight: 'bold',
          fontSize: questionFontSize,
          marginBottom: isMobile ? '18px' : '32px',
          textAlign: 'center',
          letterSpacing: '-1px',
          wordBreak: 'keep-all',
          whiteSpace: 'normal',
          overflowWrap: 'break-word',
          maxWidth: '100%'
        }}
      >
        <strong>{questionNumber}. {question.text}</strong>
      </p>
      {/* 선택지 UI */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: isMobile ? 400 : 900,
          margin: '0 auto',
          padding: isMobile ? '16px 0' : '32px 0',
          position: 'relative',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: labelFontSize, marginRight: isMobile ? 16 : 56, minWidth: labelMinWidthLeft, textAlign: 'right', display: 'inline-block' }}>그렇다</span>
        <div style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: optionGap,
          position: 'relative',
        }}>
          {[5, 4, 3, 2, 1].map((value, index) => {
            const size = optionSizeArr[index];
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
                    backgroundColor: answerValue === value ? '#FF7A5A' : '#0a3dcc',
                    borderRadius: '50%',
                    display: 'inline-block',
                    border: answerValue === value ? '3px solid #FF7A5A' : '3px solid transparent',
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
        <span style={{ fontWeight: 700, fontSize: labelFontSize, marginLeft: isMobile ? 16 : 56, minWidth: labelMinWidthRight, textAlign: 'left' }}>그렇지않다</span>
      </div>
    </div>
  );
};

export default Question;