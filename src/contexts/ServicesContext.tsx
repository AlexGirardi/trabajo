import React, { createContext, useContext, ReactNode } from 'react';
import { examAIService, ExamAIService } from '../services/examAIService';
import { errorHandler } from '../services/ErrorHandler';
import type { ErrorHandlerService } from '../services/ErrorHandler';

interface ServicesContextValue {
  examAIService: ExamAIService;
  errorHandler: typeof errorHandler;
}

const ServicesContext = createContext<ServicesContextValue | undefined>(undefined);

interface ServicesProviderProps {
  children: ReactNode;
  services?: Partial<ServicesContextValue>;
}

export function ServicesProvider({ children, services }: ServicesProviderProps) {
  const defaultServices: ServicesContextValue = {
    examAIService,
    errorHandler
  };

  const value = {
    ...defaultServices,
    ...services
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices(): ServicesContextValue {
  const context = useContext(ServicesContext);

  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }

  return context;
}

export function useExamAIService(): ExamAIService {
  const { examAIService } = useServices();
  return examAIService;
}

export function useErrorHandler(): typeof errorHandler {
  const { errorHandler } = useServices();
  return errorHandler;
}
