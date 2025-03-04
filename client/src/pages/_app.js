// pages/_app.js
import { Provider } from "react-redux";
import { store } from "@/redux/store"; // Adjust the path to your Redux store
import "../app/globals.css"; // Assuming this is your global CSS

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;