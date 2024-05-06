//header
'use strict';

function findOffset(element) {
	var top = 0, left = 0;

	do {
		top += element.offsetTop || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while (element);

	return {
		top: top,
		left: left
	};
}

window.onload = function () {
	var stickyHeader = document.querySelector('header');
	var BackHeader = document.querySelector('.header_if_fixed');
	var goUpBtn = document.querySelector('.go_upblock');
	var headerOffset = findOffset(stickyHeader);

	window.onscroll = function () {
		// body.scrollTop is deprecated and no longer available on Firefox
		var bodyScrollTop = document.documentElement.scrollTop || document.body.scrollTop;

		if (bodyScrollTop > headerOffset.top) {
			stickyHeader.classList.add('fixed', 'sticky');
			BackHeader.classList.remove('hidden');
			goUpBtn.classList.remove('go_upblock_yes');
		} else {
			stickyHeader.classList.remove('fixed', 'sticky');
			BackHeader.classList.add('hidden');
			goUpBtn.classList.add('go_upblock_yes');
		}
	};
};

// slider

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
			prefix: prefix, // префикс для классов
			el: el, // элемент который нужно активировать как ItcSlider
			elWrapper: el.querySelector(`.${prefix}${this.constructor.#EL_WRAPPER}`), // элемент с #CLASS_WRAPPER
			elItems: el.querySelector(`.${prefix}${this.constructor.#EL_ITEMS}`), // элемент, в котором находятся слайды
			elListItem: el.querySelectorAll(`.${prefix}${this.constructor.#EL_ITEM}`), // список элементов, являющиеся слайдами
			btnPrev: el.querySelector(`.${prefix}${this.constructor.#BTN_PREV}`), // кнопка, для перехода к предыдущему слайду
			btnNext: el.querySelector(`.${prefix}${this.constructor.#BTN_NEXT}`), // кнопка, для перехода к следующему слайду
			btnClassHide: prefix + this.constructor.#BTN_HIDE, // класс для скрытия кнопки
			exOrderMin: 0,
			exOrderMax: 0,
			exItemMin: null,
			exItemMax: null,
			exTranslateMin: 0,
			exTranslateMax: 0,
			direction: 'next', // направление смены слайдов
			intervalId: null, // id таймера
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
	 * Статический метод, который возвращает экземпляр ItcSlider, связанный с DOM-элементом
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
			return slider;
		} catch (e) {
			console.error(e);
		}
	}

	// статический метод для активирования элементов как ItcSlider на основе data-атрибутов
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

	// приватный метод для выполнения первичной иницианализации
	#init() {
		// состояние элементов
		this.#state.els = [];
		// текущее значение translate
		this.#state.translate = 0;
		// позиции активных элементов
		this.#state.activeItems = [];
		// состояние элементов
		this.#state.isBalancing = false;
		// ширина одного слайда
		this.#state.width = this.#state.elListItem[0].getBoundingClientRect().width;
		// ширина #EL_WRAPPER
		const widthWrapper = this.#state.elWrapper.getBoundingClientRect().width;
		// количество активных элементов
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


//file input

let inputs = document.querySelectorAll('.input__file');
Array.prototype.forEach.call(inputs, function (input) {
	let label = input.nextElementSibling,
		labelVal = label.querySelector('.input__file-button-text').innerText;

	input.addEventListener('change', function (e) {
		let countFiles = '';
		if (this.files && this.files.length >= 1)
			countFiles = this.files.length;
		if (countFiles)
			label.querySelector('.input__file-button-text').innerText = 'Файл выбран'
		else
			label.querySelector('.input__file-button-text').innerText = labelVal;
	});
});

//password

function show_hide_password(target) {
	var input = document.getElementById('password-input');
	if (input.getAttribute('type') == 'password') {
		target.classList.add('view');
		input.setAttribute('type', 'text');
	} else {
		target.classList.remove('view');
		input.setAttribute('type', 'password');
	}
	return false;
}

//registration and authorization

//var btnAutorization = document.getElementById('btnAutorization');
//var btnRegistration = document.getElementById('btnRegistration');
//var formRegister = document.getElementById('registration');
//var formAuthorization = document.getElementById('authorization');

//btnAutorization.onclick = function (evt) {
//	evt.preventDefault();
//	formAuthorization.classList.remove('hidden');
//	formRegister.classList.add('hidden');
//}

//btnRegistration.onclick = function (evt) {
//	evt.preventDefault();
//	formRegister.classList.remove('hidden');
//	formAuthorization.classList.add('hidden');
//}



//bg_main

(function () {
	// Add event listener
	document.addEventListener("mousemove", parallax);
	const elem = document.querySelector(".mask");
	function parallax(e) {
		let _w = window.innerWidth / 2;
		let _h = window.innerHeight / 2;
		let _mouseX = e.clientX;
		let _mouseY = e.clientY;
		let _depth1 = `${60 - (_mouseX - _w) * 0.01}% ${60 - (_mouseY - _h) * 0.01}%`;
		let _depth2 = `${60 - (_mouseX - _w) * 0.03}% ${60 - (_mouseY - _h) * 0.03}%`;
		let _depth3 = `${60 - (_mouseX - _w) * 0.1}% ${60 - (_mouseY - _h) * 0.1}%`;
		let x = `${_depth3}, ${_depth2}, ${_depth1}`;
		elem.style.backgroundPosition = x;
	}
})();

//шапка
function menuOnClick() {
	document.getElementById("menu-bar").classList.toggle("change");
	document.querySelector("nav").classList.toggle("change");
	document.getElementById("menu-bg").classList.toggle("change-bg");
}

//modal content

let answer = document.querySelector('.modal-body')
let modal = document.querySelector('.modal-content');
let btnModal = document.querySelector('.btn-primary');
let textModalHead = document.querySelector('.modal-title')
let email = document.querySelector('.subscription-email');

modal.onsubmit = function (evt) {
	evt.preventDefault();
	if (textModalHead !== null)
		textModalHead.textContent = 'Спасибо!'
	if (email != null)
		answer.textContent = 'Ответ будет выслан на почту: ' + email.value;
	else
		answer.textContent = 'Ответ будет выслан на почту. Товар будет добавлен после рассмотрения. Спасибо за ожидание!';
	btnModal.classList.add('hidden')
};

//news block


let itemsNews = document.querySelectorAll('.news_site_items>ul>li')

itemsNews.forEach(function (elem) {
	elem.classList.remove('block_active_news')
	if (elem.classList.contains('block_active_news') == false) {
		elem.addEventListener('click', function () {
			let itemsNewsNoActive = document.querySelector('.block_active_news')
			if (itemsNewsNoActive == null) {
				elem.classList.add('block_active_news')
			}
			else {
				if (elem.classList.contains('block_active_news')) {
					elem.classList.remove('block_active_news')
				}
				else {
					itemsNewsNoActive.classList.remove('block_active_news')
					elem.classList.add('block_active_news')
				}
			}
		})
	}
})



function openNews() {
	document.querySelector("menu-bar").classList.toggle("change");
	document.querySelector("nav").classList.toggle("change");
	document.getElementById("menu-bg").classList.toggle("change");
}

var chatText = document.querySelector('.form-control')
var Messages = document.querySelectorAll('.message')
var MessageContainer = document.querySelector('.chat-message-list')
var btnChatSend = document.querySelector('.chat-form-btn')

btnChatSend.addEventListener('click', function (evt) {
	evt.preventDefault();
});


let themeButtonDark = document.querySelector('.theme-button-dark');
let themeButtonLight = document.querySelector('.theme-button-light');
let fontButtonSansSerif = document.querySelector('.font-button-sans-serif');
let fontButtonSerif = document.querySelector('.font-button-serif');

themeButtonDark.addEventListener('click', function(argument) {
	document.body.classList.add('dark');
	document.body.classList.remove('light');
	themeButtonDark.classList.add('active');
	themeButtonLight.classList.remove('active');
});

themeButtonLight.addEventListener('click', function() {
	document.body.classList.add('light');
	document.body.classList.remove('dark');
	themeButtonLight.classList.add('active');
	themeButtonDark.classList.remove('active');
});

fontButtonSansSerif.addEventListener('click', function() {
	document.body.classList.add('sans-serif');
	document.body.classList.remove('serif');
	fontButtonSansSerif.classList.add('active');
	fontButtonSerif.classList.remove('active');
});

fontButtonSerif.addEventListener('click', function() {
	document.body.classList.add('serif');
	document.body.classList.remove('sans-serif');
	fontButtonSerif.classList.add('active');
	fontButtonSansSerif.classList.remove('active');
});

//Кнопки показать больше

let blogArticles = document.querySelectorAll('.blog-article')

for (let blogArticle of blogArticles) {
	let moreButton = blogArticle.querySelector('.more');
	moreButton.onclick = function(){
		blogArticle.classList.remove('short');
	};
};

//Изменение показа списка

let cardViewButtonGrid = document.querySelector('.card-view-button-grid');
let cardViewButtonList = document.querySelector('.card-view-button-list');
let cards = document.querySelector('.cards')

cardViewButtonGrid.addEventListener('click', function(){
	cards.classList.add('grid');
	cards.classList.remove('list')
	cardViewButtonGrid.classList.add('active')
	cardViewButtonList.classList.remove('active')
})

cardViewButtonList.addEventListener('click', function(){
	cards.classList.add('list');
	cards.classList.remove('grid')
	cardViewButtonGrid.classList.remove('active')
	cardViewButtonList.classList.add('active')
})

// Галерея

let galleryButtons = document.querySelectorAll('.preview-list a')
let activePhoto = document.querySelector('.active-photo')


for(let galleryButton of galleryButtons){
	galleryButton.onclick = function(evt){
		let activeItem = document.querySelector('.active-item')
		evt.preventDefault();
		activePhoto.src = galleryButton.href;
		activeItem.classList.remove('active-item')
		galleryButton.classList.add('active-item')
	}
}

var modal = document.getElementById("openModal");
var closeModal = document.querySelector(".close");
var openModal = document.querySelector(".popup-open");

openModal.addEventListener('click', function () {
    modal.style.visibility = 'unset';
    modal.style.opacity = 1;
})
closeModal.addEventListener('click', function (e) {
    e.preventDefault();
    modal.style.visibility = 'hidden';
    modal.style.opacity = 0;
})

const btnUp = {
    el: document.querySelector('.btn-up'),
    show() {
        this.el.classList.remove('btn-up_hide');
    },
    hide() {
        this.el.classList.add('btn-up_hide');
    },
    addEventListener() {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            scrollY > 400 ? this.show() : this.hide();
        });
        document.querySelector('.btn-up').onclick = () => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }
    }
}
btnUp.addEventListener();

var productsLength = document.querySelectorAll('.catalog__item').length
var showMore = document.querySelector('.more_link')
var items = 3;

showMore.addEventListener('click', (e) => {
    e.preventDefault()

    items+=3;
    const array = Array.from(document.querySelectorAll('.catalog__item'));

    const visItems = array.slice(0, items);

    visItems.forEach(el => el.classList.remove('hidden'));

    if (visItems.length === productsLength){
        showMore.classList.add('hidden')
    }
})