// pages/_app.js
import { Provider } from "react-redux";
import { store } from "@/redux/store"; // Adjust the path to your Redux store
import "../app/globals.css"; // Assuming this is your global CSS
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <SocketProvider>

      <Component {...pageProps} />
      {/* <Toaster /> */}
      </SocketProvider>
    </Provider>
  );
}

export default MyApp;