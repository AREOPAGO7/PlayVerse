'use client'
import Spinner from "./components/spinners/Spinner";

const Loading = () => (
  <div className='font-bold text-xl  light:bg-light' style={{
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111'
  }}>
   <Spinner />
  </div>
);

export default Loading;
