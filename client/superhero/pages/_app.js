import { React, useState } from "react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import {awsmobile} from "../src/aws-exports";
import '../styles/index.css'

// Import AWS Appsync and Cognito configuration from js file 
Amplify.configure({ ...awsmobile, ssr: true });

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;