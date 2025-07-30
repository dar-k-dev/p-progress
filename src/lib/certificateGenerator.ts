import { Goal, User } from '@/types';
import { format } from 'date-fns';

export class CertificateGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1200;
    this.canvas.height = 800;
    this.ctx = this.canvas.getContext('2d')!;
  }

  async generateCertificate(goal: Goal, user: User): Promise<string> {
    const ctx = this.ctx;
    const canvas = this.canvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, '#f1f5f9');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle pattern
    await this.addBackgroundPattern(ctx);

    // Main border
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Inner border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Header decoration
    await this.drawHeaderDecoration(ctx);

    // Certificate title
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 48px serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 180);

    // Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = '24px serif';
    ctx.fillText('This is to certify that', canvas.width / 2, 230);

    // User name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 56px serif';
    ctx.fillText(user.name.toUpperCase(), canvas.width / 2, 300);

    // Achievement text
    ctx.fillStyle = '#64748b';
    ctx.font = '24px serif';
    ctx.fillText('has successfully completed the goal', canvas.width / 2, 350);

    // Goal title
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 36px serif';
    const goalTitle = this.wrapText(ctx, goal.title, canvas.width - 200);
    let yPos = 400;
    goalTitle.forEach(line => {
      ctx.fillText(line, canvas.width / 2, yPos);
      yPos += 45;
    });

    // Goal details
    yPos += 20;
    ctx.fillStyle = '#475569';
    ctx.font = '20px sans-serif';
    
    if (goal.targetValue) {
      ctx.fillText(`Target: ${goal.targetValue} ${goal.unit || ''}`, canvas.width / 2, yPos);
      yPos += 30;
    }
    
    ctx.fillText(`Category: ${goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}`, canvas.width / 2, yPos);
    yPos += 30;
    
    ctx.fillText(`Completed on: ${format(new Date(goal.updatedAt), 'MMMM dd, yyyy')}`, canvas.width / 2, yPos);

    // Achievement badge
    await this.drawAchievementBadge(ctx, canvas.width - 200, 120);

    // Footer decoration and signature area
    await this.drawFooterDecoration(ctx);

    // Signature line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 150, canvas.height - 120);
    ctx.lineTo(canvas.width / 2 + 150, canvas.height - 120);
    ctx.stroke();

    // Signature text
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.fillText('ProgressPulse Certification Authority', canvas.width / 2, canvas.height - 100);

    // Date
    ctx.fillText(`Issued: ${format(new Date(), 'MMMM dd, yyyy')}`, canvas.width / 2, canvas.height - 80);

    // Convert to PNG
    return canvas.toDataURL('image/png', 1.0);
  }

  private async addBackgroundPattern(ctx: CanvasRenderingContext2D) {
    // Add subtle geometric pattern
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    // Draw diamond pattern
    for (let x = 0; x < this.canvas.width; x += 60) {
      for (let y = 0; y < this.canvas.height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(x + 30, y);
        ctx.lineTo(x + 60, y + 30);
        ctx.lineTo(x + 30, y + 60);
        ctx.lineTo(x, y + 30);
        ctx.closePath();
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }

  private async drawHeaderDecoration(ctx: CanvasRenderingContext2D) {
    // Draw decorative elements at the top
    const centerX = this.canvas.width / 2;
    
    // Left decoration
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(centerX - 200, 140);
    ctx.lineTo(centerX - 150, 120);
    ctx.lineTo(centerX - 150, 160);
    ctx.closePath();
    ctx.fill();

    // Right decoration
    ctx.beginPath();
    ctx.moveTo(centerX + 200, 140);
    ctx.lineTo(centerX + 150, 120);
    ctx.lineTo(centerX + 150, 160);
    ctx.closePath();
    ctx.fill();

    // Center star
    this.drawStar(ctx, centerX, 140, 5, 20, 10);
  }

  private async drawAchievementBadge(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Draw achievement badge
    const radius = 50;
    
    // Outer circle
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Inner circle
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x, y, radius - 8, 0, 2 * Math.PI);
    ctx.fill();

    // Trophy icon (simplified)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆', x, y + 15);

    // Badge text
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ACHIEVED', x, y + 70);
  }

  private async drawFooterDecoration(ctx: CanvasRenderingContext2D) {
    // Draw decorative footer elements
    const centerX = this.canvas.width / 2;
    const bottomY = this.canvas.height - 150;

    // Left flourish
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 300, bottomY);
    ctx.quadraticCurveTo(centerX - 250, bottomY - 20, centerX - 200, bottomY);
    ctx.quadraticCurveTo(centerX - 150, bottomY + 20, centerX - 100, bottomY);
    ctx.stroke();

    // Right flourish
    ctx.beginPath();
    ctx.moveTo(centerX + 300, bottomY);
    ctx.quadraticCurveTo(centerX + 250, bottomY - 20, centerX + 200, bottomY);
    ctx.quadraticCurveTo(centerX + 150, bottomY + 20, centerX + 100, bottomY);
    ctx.stroke();
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  downloadCertificate(dataUrl: string, goalTitle: string) {
    const link = document.createElement('a');
    link.download = `${goalTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_certificate.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const certificateGenerator = new CertificateGenerator();