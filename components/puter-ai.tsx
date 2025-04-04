import React, { useEffect } from 'react';

const PuterAi: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    document.body.appendChild(script);

    // Cleanup the script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []); // Closing the useEffect hook properly
};
