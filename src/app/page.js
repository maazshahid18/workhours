'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from './page.module.css';
import InstallPrompt from './components/InstallPrompt';

export default function Home() {
  const [arrivalTime, setArrivalTime] = useState('');
  const [requiredHours, setRequiredHours] = useState(9);
  const [bufferPercentage, setBufferPercentage] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [is24Hour, setIs24Hour] = useState(true);

  const [arrivalDateTime, setArrivalDateTime] = useState(null);
  const [departureDateTime, setDepartureDateTime] = useState(null);
  const [fullDepartureDateTime, setFullDepartureDateTime] = useState(null);

  const formatTime = useCallback((date) => {
    if (is24Hour) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      return `${hours}:${minutes} ${ampm}`;
    }
  }, [is24Hour]);

  const departureTimeMin = useMemo(() => {
    return departureDateTime ? formatTime(departureDateTime) : null;
  }, [departureDateTime, formatTime]);

  const departureTimeFull = useMemo(() => {
    return fullDepartureDateTime ? formatTime(fullDepartureDateTime) : null;
  }, [fullDepartureDateTime, formatTime]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timeRemainingFull, setTimeRemainingFull] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressFull, setProgressFull] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCelebrationFull, setShowCelebrationFull] = useState(false);
  const intervalRef = useRef(null);

  const minimumHours = requiredHours * (1 - bufferPercentage / 100);

  // Helper function to set default time
  const setDefaultTime = useCallback(() => {
    // Default to 10:00 AM as requested
    setArrivalTime('10:00');
  }, []);





  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('workhours-data');
    const today = new Date().toDateString();

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        // Check if the saved data is from today
        if (parsed.date === today) {
          // Restore saved data
          setArrivalTime(parsed.arrivalTime || '');
          setRequiredHours(parsed.requiredHours || 9);
          setBufferPercentage(parsed.bufferPercentage || 5);
          setIs24Hour(parsed.is24Hour !== undefined ? parsed.is24Hour : true);

          // If there was a calculation, restore it
          if (parsed.arrivalDateTime && parsed.departureDateTime && parsed.fullDepartureDateTime) {
            const arrival = new Date(parsed.arrivalDateTime);
            const departureMin = new Date(parsed.departureDateTime);
            const departureFull = new Date(parsed.fullDepartureDateTime);

            setArrivalDateTime(arrival);
            setDepartureDateTime(departureMin);
            setFullDepartureDateTime(departureFull);
          }
        } else {
          // Different day, clear old data and set default time
          localStorage.removeItem('workhours-data');
          setDefaultTime();
        }
      } catch (e) {
        console.error('Error loading saved data:', e);
        setDefaultTime();
      }
    } else {
      // No saved data, set default time
      setDefaultTime();
    }
  }, [setDefaultTime]);

  // Save to localStorage whenever calculation happens
  useEffect(() => {
    if (arrivalDateTime && departureDateTime && fullDepartureDateTime) {
      const today = new Date().toDateString();
      const dataToSave = {
        date: today,
        arrivalTime,
        requiredHours,
        bufferPercentage,
        is24Hour,
        arrivalDateTime: arrivalDateTime.toISOString(),
        departureDateTime: departureDateTime.toISOString(),
        fullDepartureDateTime: fullDepartureDateTime.toISOString(),
      };
      localStorage.setItem('workhours-data', JSON.stringify(dataToSave));
    }
  }, [arrivalDateTime, departureDateTime, fullDepartureDateTime, arrivalTime, requiredHours, bufferPercentage, is24Hour]);



  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const createConfetti = useCallback((color) => {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = color;
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.opacity = '1';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.zIndex = '9999';
    confetti.style.pointerEvents = 'none';
    confetti.style.borderRadius = '50%'; // Round confetti for softer look

    document.body.appendChild(confetti);

    const duration = 3000 + Math.random() * 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        const top = progress * (window.innerHeight + 20);
        const wobble = Math.sin(progress * 10) * 50;

        confetti.style.top = top + 'px';
        confetti.style.left = (parseFloat(confetti.style.left) + wobble * 0.01) + 'px';
        confetti.style.opacity = 1 - progress;
        confetti.style.transform = `rotate(${progress * 720}deg)`;

        requestAnimationFrame(animate);
      } else {
        confetti.remove();
      }
    };

    requestAnimationFrame(animate);
  }, []); // No dependencies

  const triggerConfetti = useCallback(() => {
    // Pastel colors
    const colors = ['#a8edea', '#fed6e3', '#e0c3fc', '#8ec5fc', '#ff9a9e', '#fecfef'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      createConfetti(colors[Math.floor(Math.random() * colors.length)]);
    }
  }, [createConfetti]);

  // Update countdown
  useEffect(() => {
    if (!departureDateTime || !fullDepartureDateTime) return;

    const updateCountdown = () => {
      const now = new Date();

      // Update minimum hours countdown
      const remainingMin = departureDateTime - now;
      if (remainingMin <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        setProgress(100);
        setShowCelebration(true);
      } else {
        const totalSeconds = Math.floor(remainingMin / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeRemaining({ hours, minutes, seconds });

        // Calculate progress for minimum hours
        const totalWorkTime = departureDateTime - arrivalDateTime;
        const elapsedTime = now - arrivalDateTime;
        const progressPercentage = Math.min((elapsedTime / totalWorkTime) * 100, 100);
        setProgress(progressPercentage);
      }

      // Update full hours countdown
      const remainingFull = fullDepartureDateTime - now;
      if (remainingFull <= 0) {
        setTimeRemainingFull({ hours: 0, minutes: 0, seconds: 0 });
        setProgressFull(100);
        setShowCelebrationFull(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        triggerConfetti();
      } else {
        const totalSecondsFull = Math.floor(remainingFull / 1000);
        const hoursFull = Math.floor(totalSecondsFull / 3600);
        const minutesFull = Math.floor((totalSecondsFull % 3600) / 60);
        const secondsFull = totalSecondsFull % 60;
        setTimeRemainingFull({ hours: hoursFull, minutes: minutesFull, seconds: secondsFull });

        // Calculate progress for full hours
        const totalWorkTimeFull = fullDepartureDateTime - arrivalDateTime;
        const elapsedTimeFull = now - arrivalDateTime;
        const progressPercentageFull = Math.min((elapsedTimeFull / totalWorkTimeFull) * 100, 100);
        setProgressFull(progressPercentageFull);
      }
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [departureDateTime, fullDepartureDateTime, arrivalDateTime, triggerConfetti]);

  const handleCalculate = () => {
    if (!arrivalTime) {
      alert('Please enter your arrival time');
      return;
    }

    const [hours, minutes] = arrivalTime.split(':').map(Number);

    // Create arrival datetime for today
    const arrival = new Date();
    arrival.setHours(hours, minutes, 0, 0);

    // Calculate minimum departure time (arrival + minimum hours with buffer)
    const departureMin = new Date(arrival);
    const minimumMinutes = minimumHours * 60;
    departureMin.setMinutes(departureMin.getMinutes() + minimumMinutes);

    // Calculate full departure time (arrival + required hours)
    const departureFull = new Date(arrival);
    const fullMinutes = requiredHours * 60;
    departureFull.setMinutes(departureFull.getMinutes() + fullMinutes);

    setArrivalDateTime(arrival);
    setDepartureDateTime(departureMin);
    setFullDepartureDateTime(departureFull);
    setShowCelebration(false);
    setShowCelebrationFull(false);

    // Scroll to results
    setTimeout(() => {
      document.getElementById('result-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };







  const workingHoursNum = Math.floor(minimumHours);
  const workingMinutesNum = Math.round((minimumHours % 1) * 60);
  const fullHoursNum = Math.floor(requiredHours);
  const fullMinutesNum = Math.round((requiredHours % 1) * 60);

  return (
    <>
      <div className={styles.backgroundGradient}></div>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="url(#gradient)" strokeWidth="2" />
              <path d="M20 8V20L28 24" stroke="url(#gradient)" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#a8edea" />
                  <stop offset="100%" stopColor="#fed6e3" />
                </linearGradient>
              </defs>
            </svg>
            <h1>WorkTime</h1>
          </div>
          <p className={styles.subtitle}>Calculate your departure time with precision</p>
        </header>

        <main className={styles.mainContent}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerWithButton}>
                <div>
                  <h2>When did you arrive?</h2>
                  <p className={styles.cardDescription}>Enter your arrival time to calculate when you can leave</p>
                </div>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={styles.settingsBtn}
                  title="Settings"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2" />
                  </svg>
                </button>
              </div>
            </div>

            {showSettings && (
              <div className={styles.settingsPanel}>
                <div className={styles.settingRow}>
                  <label htmlFor="required-hours" className={styles.settingLabel}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    Required Hours
                  </label>
                  <input
                    type="number"
                    id="required-hours"
                    min="1"
                    max="24"
                    step="0.5"
                    value={requiredHours}
                    onChange={(e) => setRequiredHours(parseFloat(e.target.value))}
                    className={styles.settingInput}
                  />
                </div>
                <div className={styles.settingRow}>
                  <label htmlFor="buffer-percentage" className={styles.settingLabel}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M2 12h20" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Buffer Percentage
                  </label>
                  <input
                    type="number"
                    id="buffer-percentage"
                    min="0"
                    max="50"
                    step="1"
                    value={bufferPercentage}
                    onChange={(e) => setBufferPercentage(parseFloat(e.target.value))}
                    className={styles.settingInput}
                  />
                </div>
                <div className={styles.settingRow}>
                  <label className={styles.settingLabel}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    Time Format
                  </label>
                  <button
                    onClick={() => setIs24Hour(!is24Hour)}
                    className={styles.timeFormatToggle}
                  >
                    <span className={is24Hour ? styles.active : ''}>{24}h</span>
                    <span className={!is24Hour ? styles.active : ''}>{12}h</span>
                  </button>
                </div>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="arrival-time" className={styles.inputLabel}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Arrival Time
              </label>
              <input
                type="time"
                id="arrival-time"
                className={styles.timeInput}
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCalculate()}
              />
            </div>

            <div className={styles.infoBox}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Required Hours</span>
                <span className={styles.infoValue}>{fullHoursNum}h {fullMinutesNum}m</span>
              </div>
              <div className={styles.infoDivider}></div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Buffer Allowed</span>
                <span className={styles.infoValue}>{bufferPercentage}% ({Math.round(requiredHours * 60 * bufferPercentage / 100)} min)</span>
              </div>
              <div className={styles.infoDivider}></div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Minimum Hours</span>
                <span className={styles.infoValue}>{workingHoursNum}h {workingMinutesNum}m</span>
              </div>
            </div>

            <button onClick={handleCalculate} className={styles.calculateBtn}>
              <span>Calculate Departure Time</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {departureTimeMin && (
            <div className={`${styles.card} ${styles.resultCard}`} id="result-card">
              <div className={styles.resultHeader}>
                <div className={styles.pulseIndicatorFull}></div>
                <h2>You can leave at</h2>
              </div>

              {/* Primary - Full Hours */}
              <div className={styles.departureTimeFull}>
                {departureTimeFull}
              </div>

              {/* Secondary - With Buffer */}
              <div className={styles.bufferTimeSection}>
                <span className={styles.bufferLabel}>or with {bufferPercentage}% buffer:</span>
                <span className={styles.bufferTime}>{departureTimeMin}</span>
              </div>

              <div className={styles.timeBreakdown}>
                <div className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>Arrived</span>
                  <span className={styles.breakdownValue}>{formatTime(arrivalDateTime)}</span>
                </div>
                <div className={styles.breakdownArrow}>→</div>
                <div className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>Full Hours</span>
                  <span className={styles.breakdownValue}>{fullHoursNum}h {fullMinutesNum}m</span>
                </div>
                <div className={styles.breakdownArrow}>→</div>
                <div className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>Depart</span>
                  <span className={styles.breakdownValue}>{departureTimeFull}</span>
                </div>
              </div>

              {/* Countdown for Full Hours */}
              {!showCelebrationFull && timeRemainingFull && (
                <div className={styles.countdownSection}>
                  <div className={styles.countdownLabel}>Time remaining for full hours</div>
                  <div className={styles.countdown}>
                    <div className={styles.countdownUnit}>
                      <span className={styles.countdownNumber}>{String(timeRemainingFull.hours).padStart(2, '0')}</span>
                      <span className={styles.countdownText}>hours</span>
                    </div>
                    <span className={styles.countdownSeparator}>:</span>
                    <div className={styles.countdownUnit}>
                      <span className={styles.countdownNumber}>{String(timeRemainingFull.minutes).padStart(2, '0')}</span>
                      <span className={styles.countdownText}>minutes</span>
                    </div>
                    <span className={styles.countdownSeparator}>:</span>
                    <div className={styles.countdownUnit}>
                      <span className={styles.countdownNumber}>{String(timeRemainingFull.seconds).padStart(2, '0')}</span>
                      <span className={styles.countdownText}>seconds</span>
                    </div>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${progressFull}%`,
                        background: progressFull >= 90
                          ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                          : progressFull >= 70
                            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                      }}
                    ></div>
                  </div>
                  <div className={styles.progressLabel}>{Math.round(progressFull)}% complete</div>
                </div>
              )}

              {/* Buffer Time Indicator */}
              {!showCelebration && timeRemaining && !showCelebrationFull && (
                <div className={styles.bufferIndicator}>
                  <div className={styles.bufferIndicatorHeader}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>Buffer time ({bufferPercentage}%): {workingHoursNum}h {workingMinutesNum}m</span>
                  </div>
                  <div className={styles.bufferProgress}>
                    <div
                      className={styles.bufferProgressFill}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className={styles.bufferTimeRemaining}>
                    {timeRemaining.hours > 0 || timeRemaining.minutes > 0 || timeRemaining.seconds > 0
                      ? `${String(timeRemaining.hours).padStart(2, '0')}:${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')} until buffer time`
                      : 'Buffer time reached! ✅'
                    }
                  </div>
                </div>
              )}

              {showCelebration && !showCelebrationFull && (
                <div className={styles.bufferCelebration}>
                  <span className={styles.bufferCelebrationIcon}>✅</span>
                  <span>Buffer time reached! You can leave now or stay for full hours.</span>
                </div>
              )}

              {showCelebrationFull && (
                <div className={styles.celebration}>
                  <div className={styles.celebrationIcon}>🎉</div>
                  <h3>Full hours complete!</h3>
                  <p>Time to go home!</p>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className={styles.footer}>
        </footer>
      </div>
      <InstallPrompt />
    </>
  );
}
