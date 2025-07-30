import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { db } from './database';
import { Goal, Progress } from '@/types';

export class PDFExportService {
  private static instance: PDFExportService;

  static getInstance(): PDFExportService {
    if (!PDFExportService.instance) {
      PDFExportService.instance = new PDFExportService();
    }
    return PDFExportService.instance;
  }

  private drawTable(pdf: jsPDF, headers: string[], rows: string[][], startY: number): number {
    const pageWidth = pdf.internal.pageSize.width;
    const colWidth = (pageWidth - 40) / headers.length;
    let y = startY;
    
    // Table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, y, pageWidth - 40, 8, 'F');
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    pdf.rect(20, y, pageWidth - 40, 8, 'S');
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    
    headers.forEach((header, i) => {
      pdf.text(header, 22 + (i * colWidth), y + 5);
      if (i < headers.length - 1) {
        pdf.line(20 + ((i + 1) * colWidth), y, 20 + ((i + 1) * colWidth), y + 8);
      }
    });
    
    y += 8;
    
    // Table rows
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    
    rows.forEach((row, rowIndex) => {
      if (rowIndex % 2 === 1) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(20, y, pageWidth - 40, 6, 'F');
      }
      
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(20, y, pageWidth - 40, 6, 'S');
      
      row.forEach((cell, i) => {
        pdf.text(cell, 22 + (i * colWidth), y + 4);
        if (i < row.length - 1) {
          pdf.line(20 + ((i + 1) * colWidth), y, 20 + ((i + 1) * colWidth), y + 6);
        }
      });
      
      y += 6;
    });
    
    return y + 10;
  }

  async generateProgressReport(userId: string, selectedGoalIds?: string[]): Promise<void> {
    try {
      const user = await db.users.get(userId);
      if (!user) throw new Error('User not found');

      let goals = await db.getGoalsByUser(userId);
      
      if (selectedGoalIds && selectedGoalIds.length > 0) {
        goals = goals.filter(goal => selectedGoalIds.includes(goal.id));
      }

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;

      // Header
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROGRESSPULSE', 20, yPosition);
      pdf.text('PROGRESS STATEMENT', pageWidth - 20, yPosition, { align: 'right' });
      
      yPosition += 10;
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      
      yPosition += 15;
      
      // Account details
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Account Holder: ${user.name}`, 20, yPosition);
      pdf.text(`Statement Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, yPosition, { align: 'right' });
      
      yPosition += 8;
      pdf.text(`Email: ${user.email}`, 20, yPosition);
      pdf.text(`Total Goals: ${goals.length}`, pageWidth - 20, yPosition, { align: 'right' });
      
      yPosition += 20;
      
      // Summary table
      const summaryHeaders = ['Status', 'Count', 'Percentage'];
      const totalGoals = goals.length;
      const summaryRows = [
        ['Completed', goals.filter(g => g.status === 'completed').length.toString(), `${((goals.filter(g => g.status === 'completed').length / totalGoals) * 100).toFixed(1)}%`],
        ['Active', goals.filter(g => g.status === 'active').length.toString(), `${((goals.filter(g => g.status === 'active').length / totalGoals) * 100).toFixed(1)}%`],
        ['Paused', goals.filter(g => g.status === 'paused').length.toString(), `${((goals.filter(g => g.status === 'paused').length / totalGoals) * 100).toFixed(1)}%`]
      ];
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ACCOUNT SUMMARY', 20, yPosition);
      yPosition += 10;
      
      yPosition = this.drawTable(pdf, summaryHeaders, summaryRows, yPosition);
      
      // Goals table
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GOAL TRANSACTIONS', 20, yPosition);
      yPosition += 10;
      
      const goalHeaders = ['Date', 'Goal', 'Category', 'Progress', 'Status', 'Target'];
      const goalRows = goals.map(goal => [
        new Date(goal.createdAt).toLocaleDateString(),
        goal.title.length > 20 ? goal.title.substring(0, 20) + '...' : goal.title,
        goal.category,
        `${goal.targetValue ? ((goal.currentValue / goal.targetValue) * 100).toFixed(1) : '0'}%`,
        goal.status.toUpperCase(),
        `${goal.targetValue}${goal.unit || ''}`
      ]);
      
      yPosition = this.drawTable(pdf, goalHeaders, goalRows, yPosition);
      
      // Progress entries for each goal
      for (const goal of goals) {
        const progressEntries = await db.getProgressByGoal(goal.id);
        
        if (progressEntries.length === 0) continue;
        
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`PROGRESS ENTRIES - ${goal.title.toUpperCase()}`, 20, yPosition);
        yPosition += 10;
        
        const progressHeaders = ['Date', 'Value', 'Running Total', 'Note'];
        const progressRows = progressEntries.map(entry => [
          new Date(entry.date).toLocaleDateString(),
          `+${entry.value}${goal.unit || ''}`,
          `${entry.value}${goal.unit || ''}`,
          entry.note ? (entry.note.length > 30 ? entry.note.substring(0, 30) + '...' : entry.note) : '-'
        ]);
        
        yPosition = this.drawTable(pdf, progressHeaders, progressRows, yPosition);
      }
      
      // Footer
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
        pdf.text('ProgressPulse - Progress Tracking Platform', 20, pageHeight - 10);
      }

      const fileName = `progress-statement-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Failed to generate PDF report:', error);
      throw error;
    }
  }

  async generateGoalCertificate(goalId: string): Promise<void> {
    try {
      const goal = await db.goals.get(goalId);
      if (!goal || goal.status !== 'completed') {
        throw new Error('Goal not found or not completed');
      }

      const user = await db.users.get(goal.userId);
      if (!user) throw new Error('User not found');

      const pdf = new jsPDF('landscape');
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;

      // Simple border
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(2);
      pdf.rect(20, 20, pageWidth - 40, pageHeight - 40);
      
      pdf.setLineWidth(0.5);
      pdf.rect(25, 25, pageWidth - 50, pageHeight - 50);

      // Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 60, { align: 'center' });

      // User name
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'normal');
      pdf.text('This certifies that', pageWidth / 2, 90, { align: 'center' });
      
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(user.name.toUpperCase(), pageWidth / 2, 110, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'normal');
      pdf.text('has successfully completed', pageWidth / 2, 130, { align: 'center' });

      // Goal title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(goal.title.toUpperCase(), pageWidth / 2, 150, { align: 'center' });

      // Details
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const completionDate = goal.updatedAt ? new Date(goal.updatedAt).toLocaleDateString() : new Date().toLocaleDateString();
      pdf.text(`Completion Date: ${completionDate}`, pageWidth / 2, 170, { align: 'center' });
      pdf.text(`Target: ${goal.targetValue}${goal.unit || ''} | Category: ${goal.category}`, pageWidth / 2, 185, { align: 'center' });

      // Certificate ID
      const certificateId = `PP-${goal.id.slice(0, 8).toUpperCase()}`;
      pdf.setFontSize(10);
      pdf.text(`Certificate ID: ${certificateId}`, pageWidth / 2, pageHeight - 40, { align: 'center' });
      
      pdf.text('ProgressPulse Platform', pageWidth / 2, pageHeight - 30, { align: 'center' });

      const fileName = `certificate-${goal.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Failed to generate certificate:', error);
      throw error;
    }
  }
}

export const pdfExportService = PDFExportService.getInstance();

// Export functions for direct use
export const generateProgressReport = (userId: string, selectedGoalIds?: string[]) => 
  pdfExportService.generateProgressReport(userId, selectedGoalIds);

export const generateGoalCertificate = (goalId: string) => 
  pdfExportService.generateGoalCertificate(goalId);
