# Docker + Portainer Deployment Guide

## Prerequisites
- Docker and Docker Compose installed on your server
- Portainer running on your server
- Access to Portainer web interface

## Step-by-Step Implementation Guide

### Phase 1: Prepare Your Server

1. **Create Project Directory**
   ```bash
   mkdir -p /opt/docker/video-ai
   cd /opt/docker/video-ai
   ```

2. **Create Data Directories**
   ```bash
   mkdir -p ollama_data backend_data
   chmod 755 ollama_data backend_data
   ```

### Phase 2: Build Docker Image (Option A - Local Build)

1. **Upload Backend Code**
   - Upload the entire `python_backend` folder to your server
   - Place it in `/opt/docker/video-ai/`

2. **Build the Image**
   ```bash
   cd /opt/docker/video-ai/python_backend
   docker build -t video-ai-backend:latest .
   ```

### Phase 3: Deploy via Portainer

1. **Access Portainer**
   - Open your Portainer web interface
   - Navigate to "Stacks" in the sidebar

2. **Create New Stack**
   - Click "Add stack"
   - Name: `video-ai-stack`
   - Build method: "Upload"

3. **Upload Docker Compose**
   - Upload the `docker-compose.portainer.yml` file
   - Or copy-paste its contents into the editor

4. **Configure Environment Variables** (if needed)
   ```yaml
   OLLAMA_URL: http://ollama:11434
   LOG_LEVEL: INFO
   TESSDATA_PREFIX: /usr/share/tesseract-ocr/5/tessdata
   ```

5. **Update Image Reference**
   - In the docker-compose file, change:
   ```yaml
   image: your-registry/video-ai-backend:latest
   ```
   - To:
   ```yaml
   image: video-ai-backend:latest
   ```

6. **Deploy Stack**
   - Click "Deploy the stack"
   - Wait for containers to start

### Phase 4: Post-Deployment Setup

1. **Verify Container Status**
   - Check both containers are running in Portainer
   - Green status indicators should appear

2. **Download Ollama Models**
   ```bash
   # Connect to Ollama container
   docker exec -it video-ai-ollama ollama pull llama3.2:3b
   docker exec -it video-ai-ollama ollama pull llama3.2:1b
   docker exec -it video-ai-ollama ollama pull qwen2.5:3b
   ```

3. **Test Backend Health**
   ```bash
   curl http://your-server-ip:8001/health
   ```

### Phase 5: Frontend Configuration

Update your frontend to use the new backend URL:
```typescript
// In your React app
const BACKEND_URL = "http://your-server-ip:8001";
```

## Monitoring and Management

### Via Portainer UI:
- **Container Logs**: Click container → "Logs"
- **Resource Usage**: Container → "Stats"
- **Restart Services**: Container → "Restart"
- **Scale Services**: Stack → "Editor" → Update replicas

### Health Checks:
- Backend: `http://your-server-ip:8001/health`
- Ollama: `http://your-server-ip:11434/api/tags`

## Troubleshooting

### Common Issues:

1. **Ollama Models Not Found**
   ```bash
   docker exec -it video-ai-ollama ollama list
   docker exec -it video-ai-ollama ollama pull llama3.2:3b
   ```

2. **Backend Can't Connect to Ollama**
   - Check network connectivity
   - Verify OLLAMA_URL environment variable

3. **Permission Issues**
   ```bash
   sudo chown -R 1000:1000 /opt/docker/video-ai/
   ```

4. **Container Memory Issues**
   - Increase memory limits in docker-compose
   - Monitor resource usage in Portainer

### Log Access:
```bash
# Backend logs
docker logs video-ai-backend

# Ollama logs
docker logs video-ai-ollama
```

## Production Optimizations

1. **Enable Log Rotation**
2. **Set up Backup Cron Jobs**
3. **Configure Resource Monitoring**
4. **Set up SSL/HTTPS (if needed)**
5. **Configure Firewall Rules**

## URLs After Deployment:
- Backend API: `http://your-server-ip:8001`
- Ollama API: `http://your-server-ip:11434`
- Health Check: `http://your-server-ip:8001/health`

Your backend will now run 24/7 and automatically restart if it crashes!