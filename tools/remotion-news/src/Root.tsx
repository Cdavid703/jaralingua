import {Composition} from 'remotion';
import {StudioIntroduction} from './Composition';

export const RemotionRoot: React.FC = () => (
  <Composition id="StudioIntroduction" component={StudioIntroduction}
    durationInFrames={420} fps={30} width={1920} height={1080} />
);
