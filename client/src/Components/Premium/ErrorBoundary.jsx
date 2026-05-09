import React from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] bg-premium-black p-6 text-white">
        <div className="mx-auto mt-20 max-w-xl rounded-premium border border-red-400/20 bg-red-500/10 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-200" />
          <h2 className="mt-4 text-2xl font-bold">Something slipped in the interface.</h2>
          <p className="mt-2 text-slate-300">Refresh the page or move to another section while the current view recovers.</p>
        </div>
      </div>
    );
  }
}
