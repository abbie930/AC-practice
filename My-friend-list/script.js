const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const USERS_PER_PAGE = 16

const users = [];
const favoriteUsers = JSON.parse(localStorage.getItem('favoriteUsers')) || []
let filteredUsers = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')



//render users
function renderUserCard(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3 mt-3">
    <div class="card shadow m-3 align-items-center">
        <div class="add-to-favorite position-absolute top-0 end-0">
       <button type="button" class="btn btn-add-favorite" data-id="${item.id}"><i class="fa-regular fa-heart fa-add-favorite"></i>
       </button>
       </div>
    <img src=${item.avatar} class="img-show-user mt-3" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id} alt="user-avatar">
    <div class="card-body text-center">
      <p class="card-user-region">${item.region}</p>
      <p class="card-title">${item.name} ${item.surname}</p>
    </div>
  </div>
  </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}


//功能： Generate paginator depend on userAmount
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  rawHTML += ``
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}




//功能: 從總清單裡切割資料，然後回傳切割好的新陣列
function getUsersByPage(page) {
  //如果filterUsers有東西就給filerUsers，沒有就給users
  const data = filteredUsers.length ? filteredUsers : users
  //起始index
  const startIndex = (page - 1) * USERS_PER_PAGE
  //回傳切割好的新陣列
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}


//功能： 更新userinfo
function showUserInfo(id) {
  //get element
  const modalTitle = document.querySelector("#user-modal-title");
  const modalImage = document.querySelector("#user-modal-image");
  const modalEmail = document.querySelector("#user-modal-email");
  const modalGender = document.querySelector("#user-modal-gender");
  const modalAge = document.querySelector("#user-modal-age");
  const modalRegion = document.querySelector("#user-modal-region");
  const modalBirthday = document.querySelector("#user-modal-birthday");

  // 先將 modal 內容清空，以免出現上一個 user 的資料殘影
  modalTitle.textContent = "";
  modalImage.firstElementChild.src = "";
  modalEmail.textContent = "";
  modalGender.textContent = "";
  modalAge.textContent = "";
  modalRegion.textContent = "";
  modalBirthday.textContent = "";

  //show api
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data;
      modalTitle.innerHTML = `<i class="fa-solid fa-address-card"></i> ${data.name} ${data.surname}`;
      modalImage.innerHTML = `<img src="${data.avatar}" alt="user-avatar" class="img-fluid user-avatar">`;
      modalGender.innerHTML = `<i class="fa-solid fa-person-half-dress"></i> ${data.gender}`;
      modalAge.innerHTML = `AGE: ${data.age}`;
      modalRegion.innerHTML = `<i class="fa-solid fa-location-dot"></i>  ${data.region}`;
      modalBirthday.innerHTML = `<i class="fa-solid fa-cake-candles"></i> ${data.birthday}`;
      modalEmail.innerHTML = `<i class="fa-solid fa-envelope"></i> 
 ${data.email}`;
    })
    .catch((error) => console.log(error));
}

// 功能：已加入收藏清單的user，頁面刷新後紀錄不會消失
function renderFavoriteUsers() {
  const addFavBtn = document.querySelectorAll('.btn-add-favorite')
  addFavBtn.forEach(addFavBtn => {
    if (favoriteUsers.some((user) => user.id === Number(addFavBtn.dataset.id))) {
      //新增：被點擊愛心的，加入clssname，方便後續點掉愛心可以移除收藏清單
      addFavBtn.classList.add('liked')
      // console.log(addFavBtn)
      addFavBtn.innerHTML = `<i class="fa-solid fa-heart fa-solid-heart"></i>`
    }
  })
}

//功能: add user in favorite list
function addToFavorite(id) {
  //收藏清單：取目前在local storage的資料
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  //用find去朋友清單查找，id一樣的，佔存在user裡
  const user = users.find((user) => user.id === id)
  //錯誤處理：檢查重複加入
  if (list.some((user) => user.id === id)) {
    return
    // 新增點掉愛心移除收藏，所以拿掉警示
    // return swal({
    //   text: "Already on the list!",
    //   icon: "info",
    //   buttons: "OK"
    // })
  }
  //將user放進收藏清單list裡
  list.push(user)
  //呼叫localStorage.setItem，更新後的收藏清單同步到localStorage
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}


function removeFromFavorite(id) {
  //傳入的清單不存在或清單是空的就結束
  if (!favoriteUsers || !favoriteUsers.length === 0) return
  //用findIndex查找要刪除的id
  const userIndex = favoriteUsers.findIndex((user) => user.id === id)
  if (userIndex === -1) return

  //用splice刪除該項目
  favoriteUsers.splice(userIndex, 1)
  //存回localStorage
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUsers))
  //重新渲染頁面
}


//功能：點擊 show user info or add/remove favorite 
function showUserInfoOrAddFav(event) {
  const target = event.target
  const id = event.target.dataset.id
  if (target.matches(".img-show-user")) {
    showUserInfo(id);
    //新增最愛 //upate點掉愛心等同移除我的最愛
  } else if (target.matches(".btn-add-favorite")) {
    if (target.classList.contains('liked')) {
      removeFromFavorite(Number(id))
      target.classList.remove('liked')
      target.innerHTML = `<i class="fa-regular fa-heart fa-add-favorite"></i>`
    } else {
      addToFavorite(Number(id))
      target.classList.add('liked')
      target.innerHTML = `<i class="fa-solid fa-heart"></i>`
    }
  }
  renderFavoriteUsers()
}


//功能: 根據點擊到的頁數重新渲染頁面（點擊到a標籤）
function paginatorClicked(event) {
  //如果不是點擊a標籤，結束函式
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  //呼叫 renderUserCard 
  renderUserCard(getUsersByPage(page))
  renderFavoriteUsers()
}


//功能: 搜尋表單keyword過濾
function SearchFormKeyword(event) {
  //預防瀏覽器預設行為
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  //更新：防止沒輸入東西更新頁面（一定要加return，不然會更新畫面，愛心紀錄被洗掉）
  if (!keyword.length) {
    return swal({
      text: "Please enter the content!",
      icon: "warning",
      buttons: "Try again",
      dangerMode: true
    })
  }
  //用filter,includes來過濾及包含有沒有符合keyword
  filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  )
  if (filteredUsers.length === 0) {
    swal({
      text: "No friends match your keyword(s).",
      icon: "info",
      buttons: "Try again",
      dangerMode: true
    })
    //清空輸入格
    searchInput.value = ""
    return  //一定要加return，不然會更新畫面，愛心紀錄被洗掉
  }
  //根據過濾後產生的數量-> paginator頁數
  renderPaginator(filteredUsers.length)
  //過濾後顯示的頁面（要顯示第一頁）
  renderUserCard(getUsersByPage(1))
}



function renderAllUsers() {
  axios
    .get(INDEX_URL)
    .then((response) => {
      users.push(...response.data.results);
      renderPaginator(users.length)
      renderUserCard(getUsersByPage(1));
      renderFavoriteUsers()
    })
    .catch((err) => console.log(err));
}



//監聽器們
dataPanel.addEventListener('click', showUserInfoOrAddFav)
searchForm.addEventListener('submit', SearchFormKeyword)
paginator.addEventListener('click', paginatorClicked)

//
renderAllUsers()