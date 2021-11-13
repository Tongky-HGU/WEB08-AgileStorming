import { IconWrapper, Wrapper } from './style';
import { closeIcon } from 'img';
import { IconImg } from 'components/atoms';
import { MouseEvent, MouseEventHandler, useEffect, useRef } from 'react';
import { IHistoryData } from 'components/organisms/HistoryBar';

interface IProps {
  onClick: (historyData: IHistoryData, idx: number) => (event: MouseEvent) => void;
  histories?: IHistoryData[];
}

const HistoryWindow: React.FC<IProps> = ({ onClick, histories }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    (scrollRef.current as HTMLElement).scrollIntoView();
  }, [scrollRef.current]);

  return (
    <Wrapper>
      {histories
        ? histories.map((historyData, idx) => (
            <IconWrapper key={idx} color={historyData.modifier.color} onClick={onClick(historyData, idx)}>
              <IconImg imgSrc={historyData.modifier.icon} altText={`히스토리 ${idx + 1}`} />
            </IconWrapper>
          ))
        : null}
      <div ref={scrollRef} id='scrollEnd' />
    </Wrapper>
  );
};

export default HistoryWindow;