'use client';

import React from 'react';
import Script from 'next/script';

export default function FacebookSDK() {
  return (
    <>
      <div id="fb-root"></div>
      <Script
        id="facebook-jssdk"
        strategy="afterInteractive"
        src="https://connect.facebook.net/en_US/sdk.js"
        onLoad={() => {
          if (typeof window !== 'undefined') {
            window.fbAsyncInit = function () {
              window.FB.init({
                appId: '2199580773967340',
                cookie: true,
                xfbml: true,
                version: 'v19.0',
              });

              window.FB.AppEvents.logPageView();
              window.dispatchEvent(new Event('fb-sdk-ready'));
            };

            // In case SDK already loaded
            if (window.FB && window.FB.init) {
              window.fbAsyncInit();
            }
          }
        }}
      />
    </>
  );
}
