// 명언 데이터 배열
let quotes = [];
let currentQuoteIndex = -1;

// DOM 요소 가져오기
const quoteTextElement = document.getElementById("quoteText");
const quoteAuthorElement = document.getElementById("quoteAuthor");
const newQuoteBtn = document.getElementById("newQuoteBtn");

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", function () {
  loadQuotes();
});

// 명언 데이터 로드
async function loadQuotes() {
  try {
    const response = await fetch("quotes.json");
    if (!response.ok) {
      throw new Error("명언 데이터를 불러올 수 없습니다.");
    }
    quotes = await response.json();

    // 첫 번째 명언 표시
    displayRandomQuote();

    // 버튼 이벤트 리스너 등록
    newQuoteBtn.addEventListener("click", handleNewQuoteClick);
  } catch (error) {
    console.error("명언 로드 에러:", error);
    showError("명언을 불러오는 중 오류가 발생했습니다.");
  }
}

// 랜덤 명언 표시
function displayRandomQuote() {
  if (quotes.length === 0) {
    showError("표시할 명언이 없습니다.");
    return;
  }

  // 이전 명언과 다른 명언 선택
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * quotes.length);
  } while (newIndex === currentQuoteIndex && quotes.length > 1);

  currentQuoteIndex = newIndex;
  const selectedQuote = quotes[currentQuoteIndex];

  // 애니메이션과 함께 명언 업데이트
  updateQuoteWithAnimation(selectedQuote.quote, selectedQuote.author);
}

// 애니메이션과 함께 명언 업데이트
function updateQuoteWithAnimation(quote, author) {
  // 페이드 아웃 효과
  quoteTextElement.classList.add("fade-out");
  quoteAuthorElement.classList.add("fade-out");

  // 애니메이션 완료 후 내용 변경
  setTimeout(() => {
    quoteTextElement.textContent = quote;
    quoteAuthorElement.textContent = author;

    // 페이드 인 효과
    quoteTextElement.classList.remove("fade-out");
    quoteAuthorElement.classList.remove("fade-out");
    quoteTextElement.classList.add("fade-in");
    quoteAuthorElement.classList.add("fade-in");

    // 페이드 인 클래스 제거
    setTimeout(() => {
      quoteTextElement.classList.remove("fade-in");
      quoteAuthorElement.classList.remove("fade-in");
    }, 500);
  }, 250);
}

// 새 명언 보기 버튼 클릭 핸들러
function handleNewQuoteClick() {
  // 버튼 로딩 상태 활성화
  newQuoteBtn.classList.add("loading");
  newQuoteBtn.disabled = true;

  // 짧은 지연 후 새 명언 표시 (사용자 경험 개선)
  setTimeout(() => {
    displayRandomQuote();

    // 로딩 상태 해제
    newQuoteBtn.classList.remove("loading");
    newQuoteBtn.disabled = false;
  }, 300);
}

// 에러 메시지 표시
function showError(message) {
  quoteTextElement.textContent = message;
  quoteAuthorElement.textContent = "";
  quoteTextElement.style.color = "#e74c3c";
}

// 키보드 접근성 지원
document.addEventListener("keydown", function (event) {
  // 스페이스바 또는 엔터키로 새 명언 보기
  if (
    (event.code === "Space" || event.code === "Enter") &&
    document.activeElement === newQuoteBtn
  ) {
    event.preventDefault();
    handleNewQuoteClick();
  }
});

// 페이지 가시성 변경 시 새 명언 표시 (선택적 기능)
document.addEventListener("visibilitychange", function () {
  if (!document.hidden && quotes.length > 0) {
    // 페이지가 다시 보이면 새 명언 표시 (사용자 재방문 시)
    setTimeout(() => {
      displayRandomQuote();
    }, 500);
  }
});

// 터치 이벤트 지원 (모바일 환경)
let touchStartTime = 0;
newQuoteBtn.addEventListener("touchstart", function () {
  touchStartTime = Date.now();
});

newQuoteBtn.addEventListener("touchend", function (event) {
  const touchEndTime = Date.now();
  const touchDuration = touchEndTime - touchStartTime;

  // 빠른 터치 (탭)인 경우에만 실행
  if (touchDuration < 200) {
    event.preventDefault();
    handleNewQuoteClick();
  }
});

// 명언 공유 기능 (향후 확장 가능)
function shareQuote() {
  if (currentQuoteIndex >= 0 && quotes[currentQuoteIndex]) {
    const quote = quotes[currentQuoteIndex];
    const shareText = `"${quote.quote}" - ${quote.author}`;

    if (navigator.share) {
      navigator.share({
        title: "명언 제조기",
        text: shareText,
        url: window.location.href,
      });
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(shareText).then(() => {
        console.log("명언이 클립보드에 복사되었습니다.");
      });
    }
  }
}

// 성능 최적화를 위한 디바운싱
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 윈도우 리사이즈 이벤트 최적화
const debouncedResize = debounce(() => {
  // 리사이즈 시 필요한 작업이 있으면 여기에 추가
  console.log("Window resized");
}, 250);

window.addEventListener("resize", debouncedResize);

// 에러 핸들링 개선
window.addEventListener("error", function (event) {
  console.error("전역 에러:", event.error);
  if (quotes.length === 0) {
    showError("애플리케이션 로드 중 오류가 발생했습니다.");
  }
});

// 명언 데이터 유효성 검증
function validateQuoteData(quoteData) {
  if (!Array.isArray(quoteData)) {
    throw new Error("명언 데이터 형식이 올바르지 않습니다.");
  }

  for (let i = 0; i < quoteData.length; i++) {
    const quote = quoteData[i];
    if (
      !quote.quote ||
      !quote.author ||
      typeof quote.quote !== "string" ||
      typeof quote.author !== "string"
    ) {
      throw new Error(`명언 데이터 ${i + 1}번이 올바르지 않습니다.`);
    }
  }

  return true;
}

// 로드 성능 측정 (개발 환경용)
if (typeof performance !== "undefined" && performance.mark) {
  performance.mark("quotes-app-start");

  window.addEventListener("load", function () {
    performance.mark("quotes-app-end");
    performance.measure(
      "quotes-app-load",
      "quotes-app-start",
      "quotes-app-end"
    );

    const measure = performance.getEntriesByName("quotes-app-load")[0];
    console.log(`앱 로드 시간: ${measure.duration.toFixed(2)}ms`);
  });
}
