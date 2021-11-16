import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Node } from 'components/atoms';
import { Path, TempNode } from 'components/molecules';
import { TCoord, TRect, getCurrentCoord, getGap, getType, calcRect } from 'utils/helpers';
import { getNextMapState, IMindmapData, mindmapState } from 'recoil/mindmap';
import { selectedNodeIdState } from 'recoil/node';
import { NodeContainer, ChildContainer } from './style';
import useHistoryEmitter from 'hooks/useHistoryEmitter';

interface ITreeProps {
  nodeId: number;
  mindmapData: IMindmapData;
  parentCoord: TCoord | null;
  parentId?: number;
}

const TEMP_NODE_ID = -1;
const ROOT_NODE_ID = 0;

const Tree: React.FC<ITreeProps> = ({ nodeId, mindmapData, parentCoord, parentId }) => {
  const isRoot = nodeId === ROOT_NODE_ID;
  const { rootId, mindNodes } = mindmapData;
  const node = mindNodes.get(nodeId);
  const { level, content, children } = node!;

  const { addNode } = useHistoryEmitter();
  const setMindmapData = useSetRecoilState(mindmapState);

  const selectedNodeId = useRecoilValue(selectedNodeIdState);
  const isSelected = selectedNodeId === nodeId;

  const [coord, setCoord] = useState<TCoord | null>(null);
  const [rect, setRect] = useState<TRect | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!nodeRef.current || !containerRef.current) return;

    const currentNode: HTMLElement = nodeRef.current;
    const currentContainer: HTMLElement = containerRef.current;

    const currentCoord = getCurrentCoord(currentNode);
    const gap = getGap(currentContainer);

    setCoord(currentCoord);

    if (!parentCoord || !currentCoord || !gap) return;
    const type = getType({ parentCoord, currentCoord, gap });

    setRect(calcRect({ parentCoord, currentCoord, gap, type }));
  }, [parentCoord, mindNodes]);

  const removeTempNode = () => {
    const parent = mindNodes.get(parentId!);
    parent!.children = parent!.children.filter((childId) => childId !== nodeId);
    mindNodes.set(parentId!, parent!);
    mindNodes.delete(nodeId);
    const newMapData = getNextMapState({ rootId, mindNodes });
    setMindmapData(newMapData);
  };

  const addNewNode = (nodeContent: string) => {
    const payload = {
      nodeFrom: parentId,
      dataTo: { content: nodeContent, children: JSON.stringify([]) },
    };

    addNode(payload);
  };

  const handleNodeContentFocusout = ({ currentTarget }: FormEvent<HTMLInputElement>) => {
    const targetContent = currentTarget.value;

    if (targetContent) addNewNode(targetContent);
    removeTempNode();
  };

  const handleNodeContentEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const targetContent = event.currentTarget.value;

    if (targetContent) addNewNode(targetContent);
    removeTempNode();
  };

  return (
    <NodeContainer id={nodeId + 'container'} ref={containerRef} isRoot={isRoot} draggable='true' className='mindmap-area'>
      {nodeId === TEMP_NODE_ID ? (
        <TempNode
          refProp={nodeRef}
          id={nodeId.toString()}
          isSelected={isSelected}
          level={level}
          onBlur={handleNodeContentFocusout}
          onKeyPress={handleNodeContentEnter}
        />
      ) : (
        <Node ref={nodeRef} id={nodeId.toString()} level={level} isSelected={isSelected} className='node mindmap-area'>
          {content}
        </Node>
      )}
      <ChildContainer>
        {children.map((childrenId) => (
          <Tree key={childrenId} nodeId={childrenId} mindmapData={mindmapData} parentCoord={coord} parentId={nodeId} />
        ))}
      </ChildContainer>
      <Path rect={rect} />
    </NodeContainer>
  );
};

export default Tree;
