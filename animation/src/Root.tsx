import { Composition } from "remotion";
import { DemoAnimation } from "./DemoAnimation";

export const RemotionRoot = () => {
  return (
    <Composition
      id="DemoAnimation"
      component={DemoAnimation}
      durationInFrames={900} // 30 秒 @ 30fps
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
