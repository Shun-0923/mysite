// src/utils/user_tracker.js

class UserTracker {
  constructor() {
    if (typeof window !== 'undefined') {
      this.userId = this.getUserIdFromLocalStorage() || this.generateNewUserId();
      this.events = [];
      this.initEventListeners();
      this.loadEventsFromSessionStorage();
      // セッション終了時にイベントを保存
      window.addEventListener('beforeunload', this.saveEventsToSessionStorage.bind(this));
      console.log('UserTracker initialized for user:', this.userId);
    }
  }

  getUserIdFromLocalStorage() {
    return localStorage.getItem('userId');
  }

  generateNewUserId() {
    const newId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', newId);
    return newId;
  }

  initEventListeners() {
    // クリックイベントを追跡
    document.addEventListener('click', this.trackClick.bind(this));
    // スクロールイベントを追跡
    document.addEventListener('scroll', this.trackScroll.bind(this));
  }

  trackEvent(eventType, details = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      userId: this.userId,
      eventType: eventType,
      details: details // detailsを直接格納
    };
    this.events.push(event);
    console.log('Tracked event:', event);
    // イベントをサーバーに送信する（未実装）
  }

  trackClick(event) {
    const targetElement = event.target;
    const eventDetails = {
      target: targetElement.tagName,
      id: targetElement.id,
      className: targetElement.className
    };
    // 属性データも追跡
    for (const attr of targetElement.attributes) {
      if (attr.name.startsWith('data-')) {
        eventDetails[attr.name] = attr.value;
      }
    }
    this.trackEvent('click', eventDetails);
  }

  trackScroll() {
    // スクロールイベントはデバウンスして記録
    clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = (scrollY / documentHeight) * 100;
      if (scrollPercentage > 0 && scrollPercentage % 10 < 1) {
        this.trackEvent('scroll', { scrollY, scrollPercentage: scrollPercentage.toFixed(2) });
      }
    }, 200);
  }

  loadEventsFromSessionStorage() {
    const storedEvents = sessionStorage.getItem('userEvents');
    if (storedEvents) {
      try {
        // イベントデータをパース
        this.events = JSON.parse(storedEvents);
        console.log('Loaded events from session storage:', this.events.length);
      } catch (e) {
        console.error('Failed to parse events from session storage:', e);
      }
    }
  }

  saveEventsToSessionStorage() {
    try {
      // イベントデータをセッションストレージに保存
      sessionStorage.setItem('userEvents', JSON.stringify(this.events));
      console.log('Saved events to session storage:', this.events.length);
    } catch (e) {
      console.error('Failed to save events to session storage:', e);
    }
  }

  getRecentEvents(count = 10) {
    return this.events.slice(-count);
  }

  getRecommendedContent() {
    // 最新のイベントに基づいて推奨コンテンツを生成
    const lastEvent = this.events[this.events.length - 1];
    if (lastEvent && lastEvent.eventType === 'click' && lastEvent.details.target === 'A') {
      // リンククリックの場合、そのリンクの属性から推奨を生成
      const recommended = [];
      for (const key in lastEvent.details) {
        if (key.startsWith('data-recommend-')) {
          recommended.push(lastEvent.details[key]);
        }
      }
      return recommended.length > 0 ? recommended : ['Default recommended content for link click'];
    }
    return ['General Recommended Content A', 'General Recommended Content B'];
  }
}

// グローバルスコープに公開
if (typeof window !== 'undefined') {
  window.userTracker = new UserTracker();
}
