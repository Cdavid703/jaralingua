import {Audio} from '@remotion/media';
import {AbsoluteFill, CanvasImage, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const StudioIntroduction: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#061527', fontFamily: 'Arial, Helvetica, sans-serif', color: '#fff', overflow: 'hidden'}}>
      <CanvasImage src={staticFile('studio.webp')} style={{
        width: '100%', height: '100%', objectFit: 'cover',
        transformOrigin: '42% 38%',
        scale: interpolate(frame, [0, durationInFrames - 1], [1, 1.045], {extrapolateRight: 'clamp'}),
      }} />
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(2,14,29,.68), transparent 25%)'}} />
      <div style={{position: 'absolute', left: 72, right: 72, bottom: 52, height: 112,
        backgroundColor: 'rgba(4,24,45,.95)', borderTop: '4px solid #59dfed',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px',
        boxShadow: '0 12px 32px rgba(0,0,0,.2)'}}>
        <div style={{opacity: interpolate(frame, [0, .7 * fps], [0, 1], {extrapolateRight: 'clamp'}),
          translate: `${interpolate(frame, [0, .7 * fps], [-30, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)})}px 0`}}>
          <div style={{fontSize: 37, fontWeight: 700, letterSpacing: 3}}>GREENFORD NEWS</div>
          <div style={{fontSize: 23, color: '#b5e6f1', marginTop: 7}}>David · Studio presenter</div>
        </div>
        <div style={{fontSize: 26, fontWeight: 700, letterSpacing: 1, textAlign: 'right', lineHeight: 1.5}}>
          FICTIONAL CLASSROOM EXERCISE<br /><span style={{color: '#8deaf2'}}>NOT REAL NEWS</span>
        </div>
      </div>
      <Audio src={staticFile('01-studio-chris.mp3')} from={.7 * fps} volume={1} />
    </AbsoluteFill>
  );
};
