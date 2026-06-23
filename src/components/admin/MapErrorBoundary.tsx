"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Leaflet Map Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-96 bg-primary-bg rounded-md border border-border-primary flex flex-col items-center justify-center p-6 space-y-6 text-center">
          <div className="w-12 h-12 rounded-md bg-error/10 border border-error/20 flex items-center justify-center text-error">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
          <div className="space-y-6">
            <h6 className="text-base font-semibold text-primary-text">Map Failed to Load</h6>
            <p className="text-sm text-muted-text max-w-xs font-normal">
              An error occurred while rendering the interactive Leaflet map. Please refresh the page or check your connection.
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2 bg-brand-primary text-black rounded-md text-sm font-semibold hover:opacity-90 transition-all border-none cursor-pointer"
          >
            Retry Loading Map
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
