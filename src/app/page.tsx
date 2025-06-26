import styles from "./page.module.css";
import VisualNovel from "./1_features/visual-novel";
import { GameProvider } from "./4_shared/context/game-context";
import Background from "./2_widgets/background";
import { BackgroundProvider } from "./4_shared/context/background-context";
import Character from "./2_widgets/character";
import ContinueEvent from "./2_widgets/continue-event";
import CutsceneOverlay from "./2_widgets/cutscene-overlay";
import Wardrobe from "./2_widgets/wardrobe";
import InfoToast from "./2_widgets/info-toast";
import { EmotionProvider } from "./4_shared/context/emotion-context";

const mainStart = "0x010000000000C91B";
const secondSound = "0x010000000000CF49";

export default function Home() {
  return (
    <div className={styles.page}>
      <GameProvider
        startId={
          mainStart
          // secondSound
        }
      >
        <BackgroundProvider>
          <EmotionProvider>
            <InfoToast />
            <ContinueEvent />
            <Character />
            <main className={styles.main}>
              <Background />
              <CutsceneOverlay />
              <Wardrobe />
              <VisualNovel />
            </main>
          </EmotionProvider>
        </BackgroundProvider>
      </GameProvider>
    </div>
  );
}
