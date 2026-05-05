import React from 'react';

interface HlsVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src?: string;
}

const HlsVideo: React.FC<HlsVideoProps> = ({ src, ...props }) => (
  <video src={src} {...props} />
);

export default HlsVideo;
