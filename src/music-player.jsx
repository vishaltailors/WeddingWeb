import songSrc from "./assets/song/our-love-festival.mp3";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Pause,
  Play,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// LRC lyrics parsed from our-love-festival.lrc
const LYRICS = [
  { time: 12.04, text: "आइए, सुनिए दिल की ये बात" },
  { time: 20.82, text: "आज सजे हैं ख़ुशियों के साथ" },
  { time: 54.81, text: "पहली मुलाक़ात की वो प्यारी सी शाम" },
  { time: 61.35, text: "धीरे से दिल ने लिया तेरा नाम" },
  { time: 67.97, text: "दो राहें मिलकर बनीं एक कहानी" },
  { time: 73.96, text: "हर मोड़ पर साथ, हर धड़कन सुहानी" },
  { time: 80.74, text: "अब आशीषों से रंग भर दीजिए" },
  { time: 84.01, text: "इस नए सफ़र में संग चल दीजिए" },
  { time: 91.67, text: "आइए, हमारे प्यार का उत्सव मनाइए" },
  { time: 98.37, text: "दो दिलों के मिलन में फूल बरसाइए" },
  { time: 104.04, text: "आपकी हँसी से ये महफ़िल सजे" },
  { time: 110.74, text: "हमारे विवाह में ज़रूर आइए" },
  { time: 130.93, text: "मेहंदी की ख़ुशबू, चुनरी का रंग" },
  { time: 134.12, text: "अपनों के चेहरों पे खुशियों की उमंग" },
  { time: 137.31, text: "माँ की दुआएँ, दोस्तों का प्यार" },
  { time: 140.5, text: "आप भी बनिए इस दिन के भागीदार" },
  { time: 143.85, text: "हाथों में हाथ, नई राह चुनें" },
  { time: 149.6, text: "आपके आशीष से सपने बुनें" },
  { time: 155.66, text: "आइए, हमारे प्यार का उत्सव मनाइए" },
  { time: 162.36, text: "दो दिलों के मिलन में फूल बरसाइए" },
  { time: 168.03, text: "आपकी हँसी से ये महफ़िल सजे" },
  { time: 174.81, text: "हमारे विवाह में ज़रूर आइए" },
  { time: 194.91, text: "तारीख़ लिखी है दिलों के नाम" },
  { time: 198.11, text: "आपके बिना अधूरी हर शाम" },
  { time: 201.14, text: "संगीत, रस्में, अपनापन साथ" },
  { time: 204.65, text: "आइए, थामिए खुशियों का हाथ" },
  { time: 210.08, text: "आइए, हमारे प्यार का उत्सव मनाइए" },
  { time: 216.78, text: "दो दिलों के मिलन में फूल बरसाइए" },
  { time: 222.68, text: "ढोल की थाप पे सब झूम उठें" },
  { time: 229.14, text: "हमारे विवाह में ज़रूर आइए" },
  { time: 235.85, text: "आपकी राह तकेंगे, खुले दिल के द्वार" },
  { time: 242.71, text: "आइए, सजाइए हमारा त्योहार" },
];

function getCurrentLyricIndex(currentTime) {
  let idx = -1;
  for (let i = 0; i < LYRICS.length; i++) {
    if (currentTime >= LYRICS[i].time) idx = i;
    else break;
  }
  return idx;
}

const MotionDiv = motion.div;

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [compact, setCompact] = useState(false);
  const [compactControlsVisible, setCompactControlsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const fullLyricsRef = useRef(null);
  const unmuteRef = useRef(null);

  const currentIndex = getCurrentLyricIndex(currentTime);
  const currentLyric = currentIndex >= 0 ? LYRICS[currentIndex] : null;

  // Autoplay muted on mount; unmute on first user interaction
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = true;
    audio
      .play()
      .then(() => {
        setPlaying(true);
      })
      .catch(() => {
        // autoplay blocked entirely — stay paused, user can press play
      });

    function unmute() {
      if (!audioRef.current) return;
      audioRef.current.muted = false;
      setMuted(false);
      ["click", "keydown", "touchstart"].forEach((ev) =>
        document.removeEventListener(ev, unmute),
      );
    }
    unmuteRef.current = unmute;
    ["click", "keydown", "touchstart"].forEach((ev) =>
      document.addEventListener(ev, unmute, { once: true, passive: true }),
    );

    return () => {
      ["click", "keydown", "touchstart"].forEach((ev) =>
        document.removeEventListener(ev, unmuteRef.current),
      );
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Scroll active lyric into view when expanded
  useEffect(() => {
    if (!expanded || !fullLyricsRef.current) return;
    const active = fullLyricsRef.current.querySelector("[data-active='true']");
    if (active) {
      active.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentIndex, expanded]);

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        // still blocked — nothing to do
      }
    }
  }

  if (dismissed) return null;

  return (
    <>
      <audio ref={audioRef} src={songSrc} preload="auto" loop={false} />
      <AnimatePresence>
        <MotionDiv
          className={[
            "music-widget",
            compact && "music-widget-compact",
            compactControlsVisible && "music-widget-controls-visible",
          ]
            .filter(Boolean)
            .join(" ")}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          role="region"
          aria-label="Background music player"
          onPointerLeave={() => setCompactControlsVisible(false)}
        >
          {/* Collapsed / main row */}
          <div className="music-widget-bar">
            <button
              className="music-play-btn"
              onClick={togglePlay}
              onPointerDown={() => {
                if (compact) setCompactControlsVisible(true);
              }}
              aria-label={playing ? "Pause music" : "Play music"}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </button>

            <div className="music-info" hidden={compact}>
              <div className="music-title-row">
                {muted && playing && (
                  <span
                    className="music-muted-badge"
                    title="Tap anywhere to unmute"
                  >
                    MUTED
                  </span>
                )}
              </div>
              <AnimatePresence mode="wait">
                {muted && playing ? (
                  <MotionDiv
                    key="muted"
                    className="music-lyric-idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    Tap anywhere to unmute
                  </MotionDiv>
                ) : currentLyric && playing ? (
                  <MotionDiv
                    key={currentIndex}
                    className="music-lyric-current"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35 }}
                  >
                    {currentLyric.text}
                  </MotionDiv>
                ) : (
                  <MotionDiv
                    key="idle"
                    className="music-lyric-idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    Play/Pause the song
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>

            <button
              className="music-expand-btn"
              hidden={compact}
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Collapse lyrics" : "View full lyrics"}
              aria-expanded={expanded}
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>

            <button
              className="music-collapse-btn"
              onClick={() => {
                setCompact((value) => !value);
                setExpanded(false);
                setCompactControlsVisible(false);
              }}
              aria-label={
                compact ? "Show music player lyrics" : "Minimize music player"
              }
              title={compact ? "Show lyrics" : "Minimize player"}
              aria-expanded={!compact}
            >
              {compact ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            <button
              className="music-dismiss-btn"
              hidden={compact}
              onClick={() => {
                audioRef.current?.pause();
                setDismissed(true);
              }}
              aria-label="Close music player"
            >
              ×
            </button>
          </div>

          {/* Expanded full lyrics panel */}
          <AnimatePresence>
            {expanded && !compact && (
              <MotionDiv
                className="music-lyrics-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="music-lyrics-scroll" ref={fullLyricsRef}>
                  <p className="music-lyrics-label">FULL LYRICS</p>
                  {LYRICS.map((line, i) => (
                    <p
                      key={i}
                      data-active={i === currentIndex ? "true" : "false"}
                      className={`music-lyric-line ${i === currentIndex ? "active" : ""}`}
                    >
                      {line.text}
                    </p>
                  ))}
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </MotionDiv>
      </AnimatePresence>
    </>
  );
}
