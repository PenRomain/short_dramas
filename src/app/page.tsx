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
const _beforePaywall = "0x010000000000C9C2";
const _beforeBlackOut = "0x010000000000CB35";
const _beforeBlackOut2 = "0x010000000000CAEB";
const _way = "0x010000000000CA07";
const _paywall = "0x010000000000CFED";
const _firstTimeAlexina = "0x010000000000CAA6";
const _firstTimePenelope = "0x010000000000CDF4";
const _beforeNewBackground = "0x010000000000C9C2";

export default function Home() {
  return (
    <div className={styles.page}>
      <GameProvider
        startId={
          mainStart
          // _beforeNewBackground
          // _firstTimeAlexina
          // _firstTimePenelope
          // _beforePaywall
          // _beforeBlackOut
          // _beforeBlackOut2
          // _way
          // _paywall
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
