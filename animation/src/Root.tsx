import { Composition } from "remotion";
import { DemoAnimation } from "./DemoAnimation";

export const RemotionRoot = () => {
  return (
    <Composition
      id="DemoAnimation"
      component={DemoAnimation}
      durationInFrames={1500} // 50 秒 @ 30fps
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
