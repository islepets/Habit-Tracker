'use strict';

let habbits = [];
let habbitTh ='';
const HABBIT_KEY = 'HABBIT_KEY';
const THEME = 'THEME';
let globalActiveHabbitId;

const page = {
	menu: document.querySelector('.menu_list'),
	header:{
		h1: document.querySelector('.h1'),
		progressPrecent:document.querySelector('.progress_persent'),
		progressCoverBar: document.querySelector('.progress_cover_bar'),
	},
	content:{
		daysContanier: document.getElementById('days'),
		nextDay: document.querySelector('.habit_day'),
	},
	popap:{
		index: document.getElementById('add_popup'),
		iconField: document.querySelector('.popup_form input[name="icon"]')
	}
}

function loadData(){
	const habbitsString = localStorage.getItem(HABBIT_KEY);
	const habbitArray = JSON.parse(habbitsString);
	if(Array.isArray(habbitArray)){
		habbits = habbitArray;
	}
	const habbitTheme = localStorage.getItem(THEME);
	habbitTh = JSON.parse(habbitTheme);
}

function saveData(){
	localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
	localStorage.setItem(THEME, JSON.stringify(habbitTh));
}

function reset(form, fields){
	for(const field of fields){
		form[field].value = '';
	}
}

function validateForm(form, fields){
	const formData = new FormData(form);
	const res = {};
	for(const field of fields){
		const fieldValue = formData.get(field);
		if(!fieldValue){
			form[field].classList.add('error');
			return;
		}
		form[field].classList.remove('error');
		res[field] = fieldValue;
	}
	let isValied = true;
	for(const field of fields){
		if(!res[field]){
			isValied = false;
		}
	}
	if(!isValied){
		return;
	}
	return res;
}

function rerenderMenu(activeHabbit) {
	for (const habbit of habbits) {
		const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
		if (!existed) {
			const element = document.createElement('button');
			element.setAttribute('menu-habbit-id', habbit.id);
			element.classList.add('menu_item');
			element.addEventListener('click', () => rerender(habbit.id));
			element.innerHTML = `<img src="./img/${habbit.icon}.svg" alt="${habbit.name}" />`;
			if (activeHabbit.id === habbit.id) {
				element.classList.add('menu_item_active');
			}
			page.menu.appendChild(element);
			continue;
		}
		if (activeHabbit.id === habbit.id) {
			existed.classList.add('menu_item_active');
		} else {
			existed.classList.remove('menu_item_active');
		}
	}
}

function renderHead(activeHabit){
	page.header.h1.innerText = activeHabit.name;
	const progress = activeHabit.days.length / activeHabit.target > 1
	? 100
	:activeHabit.days.length / activeHabit.target * 100;
	page.header.progressPrecent.innerText = progress.toFixed(0) + " %";
	page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function renderContent(activeHabit){
	page.content.daysContanier.innerHTML = '';
	for(const ind in activeHabit.days){
		const element = document.createElement('div');
		element.classList.add('habit');
		element.innerHTML = `<div class="habit_day">День ${Number(ind)+1}</div>
		<div class="habit_comment">${activeHabit.days[ind].comment}</div>
		<button class="habit_delete" onclick="deleteDay(${ind})">
			<img src="img/delete.svg" alt="delete">
		</button>`;
		page.content.daysContanier.appendChild(element);
	}
	page.content.nextDay.innerHTML =`День ${activeHabit.days.length+1}`;

}

function rerender(activeHabbitId) {
	globalActiveHabbitId = activeHabbitId;
	const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
	if(!activeHabbitId)
		return;
	document.location.replace(document.location.pathname+'#'+ activeHabbitId);
	rerenderMenu(activeHabbit);
	renderHead(activeHabbit);
	renderContent(activeHabbit);
}

function addDays(event){	
	event.preventDefault();
	const data = validateForm(event.target, ['comment']);
	if(!data){
		return;
	}
	habbits = habbits.map(habbit => {
		if(habbit.id === globalActiveHabbitId){
			return {
				...habbit,
				days: habbit.days.concat([{comment: data.comment}])
			}
		}
		return habbit;
	});
	reset(event.target, ['comment']);
	rerender(globalActiveHabbitId);
	saveData();
}

function deleteDay(index){
	habbits = habbits.map(habbit => {
		if(habbit.id === globalActiveHabbitId){
			habbit.days.splice(index,1);
			return {
				...habbit,
				days: habbit.days
			}
		}
		return habbit;
	});
	rerender(globalActiveHabbitId);
	saveData();
}

function togglePopup(){
	if(page.popap.index.classList.contains('cover_hidden')){
		page.popap.index.classList.remove('cover_hidden');
	}else{
		page.popap.index.classList.add('cover_hidden');
	}
}

function setIcon(context, icon){
	page.popap.iconField.value = icon;
	const activeIcon = document.querySelector('.icon.icon_active');
	activeIcon.classList.remove('icon_active');
	context.classList.add('icon_active');
}

function addHabit(event){
	event.preventDefault();
	const data = validateForm(event.target, ['name', 'icon', 'target']);
	if(!data){
		return;
	}
	const maxId = habbits.reduce((acc, habbit) => acc> habbit.id ? acc : habbit.id, 0);
	habbits.push({
		id:maxId + 1,
		name: data.name,
		target: data.target,
		icon: data.icon,
		days: []
	});
	reset(event.target, ['name', 'target']);
	togglePopup();
	saveData();
	rerender(maxId+1);

}

function changeCss() {
	const link = document.getElementById("styleBright"),
    href = link.getAttribute('href');
	if(href == "light_style.css") {
		document.getElementById("styleBright").href="dark_style.css";
		document.getElementById("logo").src="img/alternative_logo.svg";
	} else if (href == "dark_style.css") {
		document.getElementById("styleBright").href="light_style.css";
		document.getElementById("logo").src="img/logo.svg";
	}
	saveData();
}


(() => {
	loadData();
	const savedTheme = localStorage.getItem('theme');
	const hashId = Number(document.location.hash.replace('#', ''));
	const urlHabitId = habbits.find(habbit => habbit.id === hashId);
	if(urlHabitId){
		rerender(urlHabitId.id);
	}
	else{
		rerender(habbits[0].id);
	}
})();

