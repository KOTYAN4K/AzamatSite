// var btn_next = document.querySelector(".btn-next");
// var btn_prev = document.querySelector(".btn-prev");
// var wrapSlider = document.querySelector(".slider__list");
// var countSlides = document.querySelectorAll(".slide__item").length;
// console.log(countSlides)
// var currentSlide = 1;
// btn_next.addEventListener('click', function (e) {
//     e.preventDefault();
// })
// btn_prev.addEventListener('click', function (e) {
//     e.preventDefault();
// })
// if (this.screen.width > 769) {
//     slider(33.3, 3);
// } else if (screen.width > 480 && screen.width < 768){
//     slider(50, 2);
// }

// function slider(width, count) {
//     btn_next.addEventListener('click', function () {
//         if (currentSlide == count){
//             wrapSlider.style.transform = "translateX(0)";
//             currentSlide = 1;
//             console.log(currentSlide);
//         } else {
//             wrapSlider.style.transform = "translateX(-" + width * currentSlide + "%)";
//             currentSlide++;
//             console.log(currentSlide);
//         }
//     })
//     btn_prev.addEventListener('click', function(){
//         if (currentSlide == 1) {
//             wrapSlider.style.transform = "translateX(-" + (width * (countSlides - count - 1)) + "%)";
//             currentSlide = countSlides - 2;
//             console.log(currentSlide);
//         } else {
//             wrapSlider.style.transform = "translateX(-" + (width * (currentSlide - 2) - width) + "%)";
//             currentSlide--;
//             console.log(currentSlide);
//         }
//     })
// }


/**
 * @class ItcSlider
 * @version 1.0.0
 * @author https://github.com/itchief
 * @copyright Alexander Maltsev 2020 - 2022
 * @license MIT (https://github.com/itchief/ui-components/blob/master/LICENSE)
 * @tutorial https://itchief.ru/javascript/slider
 */
class ItcSlider {
    static #EL_WRAPPER = 'wrapper';
    static #EL_ITEMS = 'items';
    static #EL_ITEM = 'item';
    static #EL_ITEM_ACTIVE = 'item_active';
    static #EL_INDICATOR = 'indicator';
    static #EL_INDICATOR_ACTIVE = 'indicator_active';
    static #BTN_PREV = 'btn_prev';
    static #BTN_NEXT = 'btn_next';
    static #BTN_HIDE = 'btn_hide';
    static #TRANSITION_NONE = 'transition-none';

    static #instances = [];

    #config;
    #state;

    /**
     * @param {HTMLElement} el
     * @param {Object} config
     * @param {String} prefix
     */
    constructor(el, config = {}, prefix = 'itc-slider__') {

        this.#state = {
            prefix: prefix, // РїСЂРµС„РёРєСЃ РґР»СЏ РєР»Р°СЃСЃРѕРІ
            el: el, // СЌР»РµРјРµРЅС‚ РєРѕС‚РѕСЂС‹Р№ РЅСѓР¶РЅРѕ Р°РєС‚РёРІРёСЂРѕРІР°С‚СЊ РєР°Рє ItcSlider
            elWrapper: el.querySelector(`.${prefix}${this.constructor.#EL_WRAPPER}`), // СЌР»РµРјРµРЅС‚ СЃ #CLASS_WRAPPER
            elItems: el.querySelector(`.${prefix}${this.constructor.#EL_ITEMS}`), // СЌР»РµРјРµРЅС‚, РІ РєРѕС‚РѕСЂРѕРј РЅР°С…РѕРґСЏС‚СЃСЏ СЃР»Р°Р№РґС‹
            elListItem: el.querySelectorAll(`.${prefix}${this.constructor.#EL_ITEM}`), // СЃРїРёСЃРѕРє СЌР»РµРјРµРЅС‚РѕРІ, СЏРІР»СЏСЋС‰РёРµСЃСЏ СЃР»Р°Р№РґР°РјРё
            btnPrev: el.querySelector(`.${prefix}${this.constructor.#BTN_PREV}`), // РєРЅРѕРїРєР°, РґР»СЏ РїРµСЂРµС…РѕРґР° Рє РїСЂРµРґС‹РґСѓС‰РµРјСѓ СЃР»Р°Р№РґСѓ
            btnNext: el.querySelector(`.${prefix}${this.constructor.#BTN_NEXT}`), // РєРЅРѕРїРєР°, РґР»СЏ РїРµСЂРµС…РѕРґР° Рє СЃР»РµРґСѓСЋС‰РµРјСѓ СЃР»Р°Р№РґСѓ
            btnClassHide: prefix + this.constructor.#BTN_HIDE, // РєР»Р°СЃСЃ РґР»СЏ СЃРєСЂС‹С‚РёСЏ РєРЅРѕРїРєРё
            exOrderMin: 0,
            exOrderMax: 0,
            exItemMin: null,
            exItemMax: null,
            exTranslateMin: 0,
            exTranslateMax: 0,
            direction: 'next', // РЅР°РїСЂР°РІР»РµРЅРёРµ СЃРјРµРЅС‹ СЃР»Р°Р№РґРѕРІ
            intervalId: null, // id С‚Р°Р№РјРµСЂР°
            isSwiping: false,
            swipeX: 0,
        };

        this.#config = {
            loop: true, autoplay: false, interval: 5000, refresh: true, swipe: true, ...config
        };

        this.#init();
        this.#attachEvents();
    }

    /**
     * РЎС‚Р°С‚РёС‡РµСЃРєРёР№ РјРµС‚РѕРґ, РєРѕС‚РѕСЂС‹Р№ РІРѕР·РІСЂР°С‰Р°РµС‚ СЌРєР·РµРјРїР»СЏСЂ ItcSlider, СЃРІСЏР·Р°РЅРЅС‹Р№ СЃ DOM-СЌР»РµРјРµРЅС‚РѕРј
     * @param {HTMLElement} elSlider
     * @returns {?ItcSlider}
     */
    static getInstance(elSlider) {
        const found = this.#instances.find(el => el.target === elSlider);
        if (found) {
            return found.instance;
        }
        return null;
    }

    /**
     * @param {String|HTMLElement} target
     * @param {Object} config
     * @param {String} prefix
     */
    static getOrCreateInstance(target, config = {}, prefix = 'itc-slider__') {
        try {
            const elSlider = typeof target === 'string' ? document.querySelector(target) : target;
            const result = this.getInstance(elSlider);
            if (result) {
                return result;
            }
            const slider = new this(elSlider, config, prefix);
            this.#instances.push({ target: elSlider, instance: slider });
            return this;
        } catch (e) {
            console.error(e);
        }
    }

    // СЃС‚Р°С‚РёС‡РµСЃРєРёР№ РјРµС‚РѕРґ РґР»СЏ Р°РєС‚РёРІРёСЂРѕРІР°РЅРёСЏ СЌР»РµРјРµРЅС‚РѕРІ РєР°Рє ItcSlider РЅР° РѕСЃРЅРѕРІРµ data-Р°С‚СЂРёР±СѓС‚РѕРІ
    static createInstances() {
        document.querySelectorAll('[data-slider="itc-slider"]').forEach((el) => {
            const dataset = el.dataset;
            const params = {};
            Object.keys(dataset).forEach((key) => {
                if (key === 'slider') {
                    return;
                }
                let value = dataset[key];
                value = value === 'true' ? true : value;
                value = value === 'false' ? false : value;
                value = Number.isNaN(Number(value)) ? Number(value) : value;
                params[key] = value;
            });
            this.getOrCreateInstance(el, params);
        });
    }

    next() {
        this.#state.direction = 'next';
        this.#move();
    }

    prev() {
        this.#state.direction = 'prev';
        this.#move();
    }

    moveTo(index) {
        this.#moveTo(index);
    }

    reset() {
        this.#reset();
    }

    dispose() {
        this.#detachEvents();
        const transitionNoneClass = this.#state.prefix + this.constructor.#TRANSITION_NONE;
        const activeClass = this.#state.prefix + this.constructor.#EL_ITEM_ACTIVE;
        this.#autoplay('stop');
        this.#state.elItems.classList.add(transitionNoneClass);
        this.#state.elItems.style.transform = '';
        this.#state.elListItem.forEach((el) => {
            el.style.transform = '';
            el.classList.remove(activeClass);
        });
        const selIndicators = `${this.#state.prefix}${this.constructor.#EL_INDICATOR_ACTIVE}`;
        document.querySelectorAll(`.${selIndicators}`).forEach((el) => {
            el.classList.remove(selIndicators);
        })
        this.#state.elItems.offsetHeight;
        this.#state.elItems.classList.remove(transitionNoneClass);
        const index = this.constructor.#instances.findIndex(el => el.target === this.#state.el);
        this.constructor.#instances.splice(index, 1);
    }

    #onClick(e) {
        const classBtnPrev = this.#state.prefix + this.constructor.#BTN_PREV;
        const classBtnNext = this.#state.prefix + this.constructor.#BTN_NEXT;
        this.#autoplay('stop');
        if (e.target.closest(`.${classBtnPrev}`) || e.target.closest(`.${classBtnNext}`)) {
            this.#state.direction = e.target.closest(`.${classBtnPrev}`) ? 'prev' : 'next';
            this.#move();
        } else if (e.target.dataset.slideTo) {
            const index = parseInt(e.target.dataset.slideTo, 10);
            this.#moveTo(index);
        }
        this.#config.loop ? this.#autoplay() : null;
    }

    #onMouseEnter() {
        this.#autoplay('stop');
    }

    #onMouseLeave() {
        this.#autoplay();
    }

    #onResize() {
        window.requestAnimationFrame(this.#reset.bind(this));
    }

    #onSwipeStart(e) {
        this.#autoplay('stop');
        const event = e.type.search('touch') === 0 ? e.touches[0] : e;
        this.#state.swipeX = event.clientX;
        this.#state.isSwiping = true;
    }

    #onSwipeEnd(e) {
        if (!this.#state.isSwiping) {
            return;
        }
        const event = e.type.search('touch') === 0 ? e.changedTouches[0] : e;
        const diffPos = this.#state.swipeX - event.clientX;
        if (diffPos > 50) {
            this.#state.direction = 'next';
            this.#move();
        } else if (diffPos < -50) {
            this.#state.direction = 'prev';
            this.#move();
        }
        this.#state.isSwiping = false;
        if (this.#config.loop) {
            this.#autoplay();
        }
    }

    #onTransitionStart() {
        if (this.#state.isBalancing) {
            return;
        }
        this.#state.isBalancing = true;
        window.requestAnimationFrame(this.#balanceItems.bind(this));
    }

    #onTransitionEnd() {
        this.#state.isBalancing = false;
    }

    #onDragStart(e) {
        e.preventDefault();
    }

    #onVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            this.#autoplay('stop');
        } else if (document.visibilityState === 'visible' && this.#config.loop) {
            this.#autoplay();
        }
    }

    #attachEvents() {
        this.#state.events = {
            'click': [this.#state.el, this.#onClick.bind(this), true],
            'mouseenter': [this.#state.el, this.#onMouseEnter.bind(this), true],
            'mouseleave': [this.#state.el, this.#onMouseLeave.bind(this), true],
            'resize': [window, this.#onResize.bind(this), this.#config.refresh],
            'itc-slider__transition-start': [this.#state.elItems, this.#onTransitionStart.bind(this), this.#config.loop],
            'transitionend': [this.#state.elItems, this.#onTransitionEnd.bind(this), this.#config.loop],
            'touchstart': [this.#state.el, this.#onSwipeStart.bind(this), this.#config.swipe],
            'mousedown': [this.#state.el, this.#onSwipeStart.bind(this), this.#config.swipe],
            'touchend': [document, this.#onSwipeEnd.bind(this), this.#config.swipe],
            'mouseup': [document, this.#onSwipeEnd.bind(this), this.#config.swipe],
            'dragstart': [this.#state.el, this.#onDragStart.bind(this), true],
            'visibilitychange': [document, this.#onVisibilityChange.bind(this), true]
        };
        Object.keys(this.#state.events).forEach((type) => {
            if (this.#state.events[type][2]) {
                const el = this.#state.events[type][0];
                const fn = this.#state.events[type][1];
                el.addEventListener(type, fn);
            }
        });
    }

    #detachEvents() {
        Object.keys(this.#state.events).forEach((type) => {
            if (this.#state.events[type][2]) {
                const el = this.#state.events[type][0];
                const fn = this.#state.events[type][1];
                el.removeEventListener(type, fn);
            }
        });
    }

    #autoplay(action) {
        if (!this.#config.autoplay) {
            return;
        }
        if (action === 'stop') {
            clearInterval(this.#state.intervalId);
            this.#state.intervalId = null;
            return;
        }
        if (this.#state.intervalId === null) {
            this.#state.intervalId = setInterval(() => {
                this.#state.direction = 'next';
                this.#move();
            }, this.#config.interval);
        }
    }

    #balanceItems() {
        if (!this.#state.isBalancing) {
            return;
        }
        const wrapperRect = this.#state.elWrapper.getBoundingClientRect();
        const targetWidth = wrapperRect.width / this.#state.countActiveItems / 2;
        const countItems = this.#state.elListItem.length;
        if (this.#state.direction === 'next') {
            const exItemRectRight = this.#state.exItemMin.getBoundingClientRect().right;
            if (exItemRectRight < wrapperRect.left - targetWidth) {
                const elFound = this.#state.els.find((item) => item.el === this.#state.exItemMin);
                elFound.order = this.#state.exOrderMin + countItems;
                const translate = this.#state.exTranslateMin + countItems * this.#state.width;
                elFound.translate = translate;
                this.#state.exItemMin.style.transform = `translate3D(${translate}px, 0px, 0.1px)`;
                this.#updateExProperties();
            }
        } else {
            const exItemRectLeft = this.#state.exItemMax.getBoundingClientRect().left;
            if (exItemRectLeft > wrapperRect.right + targetWidth) {
                const elFound = this.#state.els.find((item) => item.el === this.#state.exItemMax);
                elFound.order = this.#state.exOrderMax - countItems;
                const translate = this.#state.exTranslateMax - countItems * this.#state.width;
                elFound.translate = translate;
                this.#state.exItemMax.style.transform = `translate3D(${translate}px, 0px, 0.1px)`;
                this.#updateExProperties();
            }
        }
        window.requestAnimationFrame(this.#balanceItems.bind(this));
    }

    #updateClasses() {
        const activeClass = this.#state.prefix + this.constructor.#EL_ITEM_ACTIVE;
        this.#state.activeItems.forEach((item, index) => {
            if (item) {
                this.#state.elListItem[index].classList.add(activeClass);
            } else {
                this.#state.elListItem[index].classList.remove(activeClass);
            }
            const elListIndicators = this.#state.el.querySelectorAll(`.${this.#state.prefix}${this.constructor.#EL_INDICATOR}`);
            if (elListIndicators.length && item) {
                elListIndicators[index].classList.add(`${this.#state.prefix}${this.constructor.#EL_INDICATOR_ACTIVE}`);
            } else if (elListIndicators.length && !item) {
                elListIndicators[index].classList.remove(`${this.#state.prefix}${this.constructor.#EL_INDICATOR_ACTIVE}`);
            }
        });
    }

    #move() {
        const widthItem = this.#state.direction === 'next' ? -this.#state.width : this.#state.width;
        const transform = this.#state.translate + widthItem;
        if (!this.#config.loop) {
            const limit = this.#state.width * (this.#state.elListItem.length - this.#state.countActiveItems);
            if (transform < -limit || transform > 0) {
                return;
            }
            if (this.#state.btnPrev) {
                this.#state.btnPrev.classList.remove(this.#state.btnClassHide);
                this.#state.btnNext.classList.remove(this.#state.btnClassHide);
            }
            if (this.#state.btnPrev && transform === -limit) {
                this.#state.btnNext.classList.add(this.#state.btnClassHide);
            } else if (this.#state.btnPrev && transform === 0) {
                this.#state.btnPrev.classList.add(this.#state.btnClassHide);
            }
        }
        if (this.#state.direction === 'next') {
            this.#state.activeItems = [...this.#state.activeItems.slice(-1), ...this.#state.activeItems.slice(0, -1)];
        } else {
            this.#state.activeItems = [...this.#state.activeItems.slice(1), ...this.#state.activeItems.slice(0, 1)];
        }
        this.#updateClasses();
        this.#state.translate = transform;
        this.#state.elItems.style.transform = `translate3D(${transform}px, 0px, 0.1px)`;
        this.#state.elItems.dispatchEvent(new CustomEvent('itc-slider__transition-start', {
            bubbles: true
        }));
    }

    #moveTo(index) {
        const delta = this.#state.activeItems.reduce((acc, current, currentIndex) => {
            const diff = current ? index - currentIndex : acc;
            return Math.abs(diff) < Math.abs(acc) ? diff : acc;
        }, this.#state.activeItems.length);
        if (delta !== 0) {
            this.#state.direction = delta > 0 ? 'next' : 'prev';
            for (let i = 0; i < Math.abs(delta); i++) {
                this.#move();
            }
        }
    }

    // РїСЂРёРІР°С‚РЅС‹Р№ РјРµС‚РѕРґ РґР»СЏ РІС‹РїРѕР»РЅРµРЅРёСЏ РїРµСЂРІРёС‡РЅРѕР№ РёРЅРёС†РёР°РЅР°Р»РёР·Р°С†РёРё
    #init() {
        // СЃРѕСЃС‚РѕСЏРЅРёРµ СЌР»РµРјРµРЅС‚РѕРІ
        this.#state.els = [];
        // С‚РµРєСѓС‰РµРµ Р·РЅР°С‡РµРЅРёРµ translate
        this.#state.translate = 0;
        // РїРѕР·РёС†РёРё Р°РєС‚РёРІРЅС‹С… СЌР»РµРјРµРЅС‚РѕРІ
        this.#state.activeItems = [];
        // СЃРѕСЃС‚РѕСЏРЅРёРµ СЌР»РµРјРµРЅС‚РѕРІ
        this.#state.isBalancing = false;
        // С€РёСЂРёРЅР° РѕРґРЅРѕРіРѕ СЃР»Р°Р№РґР°
        this.#state.width = this.#state.elListItem[0].getBoundingClientRect().width;
        // С€РёСЂРёРЅР° #EL_WRAPPER
        const widthWrapper = this.#state.elWrapper.getBoundingClientRect().width;
        // РєРѕР»РёС‡РµСЃС‚РІРѕ Р°РєС‚РёРІРЅС‹С… СЌР»РµРјРµРЅС‚РѕРІ
        this.#state.countActiveItems = Math.round(widthWrapper / this.#state.width);
        this.#state.elListItem.forEach((el, index) => {
            el.style.transform = '';
            this.#state.activeItems.push(index < this.#state.countActiveItems ? 1 : 0);
            this.#state.els.push({ el, index, order: index, translate: 0 });
        });
        if (this.#config.loop) {
            const lastIndex = this.#state.elListItem.length - 1;
            const translate = -(lastIndex + 1) * this.#state.width;
            this.#state.elListItem[lastIndex].style.transform = `translate3D(${translate}px, 0px, 0.1px)`;
            this.#state.els[lastIndex].order = -1;
            this.#state.els[lastIndex].translate = translate;
            this.#updateExProperties();
        } else if (this.#state.btnPrev) {
            this.#state.btnPrev.classList.add(this.#state.btnClassHide);
        }
        this.#updateClasses();
        this.#autoplay();
    }

    #reset() {
        const transitionNoneClass = this.#state.prefix + this.constructor.#TRANSITION_NONE;
        const widthItem = this.#state.elListItem[0].getBoundingClientRect().width;
        const widthWrapper = this.#state.elWrapper.getBoundingClientRect().width;
        const countActiveEls = Math.round(widthWrapper / widthItem);
        if (widthItem === this.#state.width && countActiveEls === this.#state.countActiveItems) {
            return;
        }
        this.#autoplay('stop');
        this.#state.elItems.classList.add(transitionNoneClass);
        this.#state.elItems.style.transform = 'translate3D(0px, 0px, 0.1px)';
        this.#init();
        window.requestAnimationFrame(() => {
            this.#state.elItems.classList.remove(transitionNoneClass);
        });
    }

    #updateExProperties() {
        const els = this.#state.els.map((item) => item.el);
        const orders = this.#state.els.map((item) => item.order);
        this.#state.exOrderMin = Math.min(...orders);
        this.#state.exOrderMax = Math.max(...orders);
        const min = orders.indexOf(this.#state.exOrderMin);
        const max = orders.indexOf(this.#state.exOrderMax);
        this.#state.exItemMin = els[min];
        this.#state.exItemMax = els[max];
        this.#state.exTranslateMin = this.#state.els[min].translate;
        this.#state.exTranslateMax = this.#state.els[max].translate;
    }
}

ItcSlider.createInstances();