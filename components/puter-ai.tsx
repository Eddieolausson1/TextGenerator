import React, { useEffect } from 'react';

const PuterAi: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  export default PuterAi;
