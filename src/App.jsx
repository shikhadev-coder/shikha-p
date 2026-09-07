import './App.css'
import { store } from './Store/store'
import { Provider } from 'react-redux'
import PageRoutes from './Component/routes'
import { ToastContainer } from 'react-toastify';
function App() {

  return (
    <>
    <Provider store={store}>
      <PageRoutes/>
      <ToastContainer />
    </Provider>
    </>
  )
}

export default App
