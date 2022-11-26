const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";

const favoriteUsers = JSON.parse(localStorage.getItem('favoriteUsers')) || []
let filteredUsers = []

const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

//render user
function renderUserCard(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3 mt-3">
    <div class="card shadow m-3 align-items-center">
    <div class="remove-from-favorite position-absolute top-0 end-0">
       <button type="button" class="btn btn-remove-favorite" data-id="${item.id}"><i class="fa-solid fa-xmark"></i>
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

//more userinfo
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


//功能：從收藏清單移除項目
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
  renderUserCard(favoriteUsers)
}

//功能：新增：點擊到要刪除的傳入removeFromFavorite
function showUserInfoOrRemoveFav(event) {
  if (event.target.matches(".img-show-user")) {
    showUserInfo(event.target.dataset.id);
    //移除已收藏
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
}


//更新：
function SearchFormKeyword(event) {
  //預防瀏覽器預設行為
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  if (!keyword.length) {
    return swal({
      text: "Please enter the content!",
      icon: "warning",
      buttons: "Try again",
      dangerMode: true
    })
  }
  //用filter,includes來過濾及包含有沒有符合keyword
  filteredUsers = favoriteUsers.filter((user) =>
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  )
  if (filteredUsers.length === 0) {
    renderUserCard(favoriteUsers) //更新：沒搜尋到相符合的，就會到收藏清單主畫面
    swal({
      text: "No friends match your keyword(s).",
      icon: "info",
      buttons: "Try again",
      dangerMode: true
    })
    searchInput.value = ""
    return
  }
  searchInput.value = ""
  renderUserCard(filteredUsers)
}



//監聽器
dataPanel.addEventListener("click", showUserInfoOrRemoveFav)
searchForm.addEventListener('submit', SearchFormKeyword)
//output
renderUserCard(favoriteUsers)