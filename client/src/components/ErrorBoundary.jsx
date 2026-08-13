import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In production this is where you'd forward to an error-tracking service.
    console.error("Ink & Ivory caught a render error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
          <p className="mb-2 font-script text-4xl text-taupe-dark">A torn page</p>
          <p className="mb-6 max-w-sm text-sm text-ink/60">
            Something went wrong loading this part of the site. Refreshing usually fixes it.
          </p>
          <button onClick={this.handleReload} className="btn-primary">
            Reload the page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
