import styles from './Home.module.css'
import logo from './logo.svg'
import wave from './wave.svg'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate()
    
    const navigateHandler = () => {
        navigate('/login')
    }

    return(
    <div className={styles.container}>
    <div className={styles.header}>
      <h1 className={styles.title}>Welcome <img src={wave} className={styles.logo}/><br/><br/>
       Mint NFTs from our collection and pay ZERO gas !</h1>
      <button className={styles.btn} onClick={navigateHandler}>Get Started</button>
    </div>
    <footer className={styles.footer}>
      <span>Powered by Biconomy!</span>
      <img src={logo} alt="Logo" className={styles.logo} />
    </footer>
  </div>
    )
}

export default Home;