function LoadingSpinner(props) {
  if (!props.showSpinner) return null;
  return (
    <div className="overlay">
      <div className="custom-spinner"></div>

      <style>{`
        .overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .custom-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #a0d8d3;
          border-top-color: #00A199;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LoadingSpinner;

