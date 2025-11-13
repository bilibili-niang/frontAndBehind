import router from '../router'

export default () => {
  localStorage.removeItem('Blade-Auth')
  router.replace('/login')
}
