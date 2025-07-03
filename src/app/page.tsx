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
import Paywall from "./2_widgets/paywall";

const mainStart = "0x010000000000C604";
const beforePaywall = "0x010000000000C9C2";
const beforeBlackOut = "0x010000000000CB35";
const beforeBlackOut2 = "0x010000000000CAEB";
const way = "0x010000000000CA07";
const paywall = "0x010000000000CFED";

export default function Home() {
  return (
    <div className={styles.page}>
      <GameProvider
        startId={
          mainStart
          // beforePaywall
          // beforeBlackOut
          // beforeBlackOut2
          // way
          // paywall
        }
      >
        <BackgroundProvider>
          <EmotionProvider>
            <InfoToast />
            <ContinueEvent />
            <Character />
            <Paywall />
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
