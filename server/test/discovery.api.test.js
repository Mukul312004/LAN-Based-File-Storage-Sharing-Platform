import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import discoveryService from '../src/discovery/discovery.service.js';

describe('LAN Device Discovery (Phase 4)', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('GET /api/devices - should return empty or active peers array', async () => {
    const res = await request(app).get('/api/devices');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/devices/manual - should register a manual fallback device', async () => {
    const res = await request(app)
      .post('/api/devices/manual')
      .send({
        host: '192.168.1.99',
        port: 3000,
        name: 'Manual Test Device',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.host).toBe('192.168.1.99');
    expect(res.body.data.name).toBe('Manual Test Device');

    // Check device now appears in GET /api/devices
    const getRes = await request(app).get('/api/devices');
    const found = getRes.body.data.find((d) => d.host === '192.168.1.99');
    expect(found).toBeDefined();
    expect(found.name).toBe('Manual Test Device');
  });

  it('POST /api/devices/manual - should return 400 if host IP is missing', async () => {
    const res = await request(app)
      .post('/api/devices/manual')
      .send({
        port: 3000,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('DiscoveryService - should accept valid peer messages and reject own packets or invalid magic', () => {
    const peerNodeId = 'remote-peer-uuid-999';

    // 1. Send simulated valid peer announcement
    const validPacket = Buffer.from(
      JSON.stringify({
        magic: 'LAN_DFS_DISCOVERY_V1',
        id: peerNodeId,
        name: 'Peer Laptop A',
        host: '192.168.1.45',
        port: 3000,
        storage: { totalSpace: 500000, freeSpace: 200000 },
        timestamp: Date.now(),
      })
    );
    discoveryService.handleIncomingMessage(validPacket, { address: '192.168.1.45', port: 41234 });

    const devicesAfter = discoveryService.getDiscoveredDevices();
    const peer = devicesAfter.find((d) => d.id === peerNodeId);
    expect(peer).toBeDefined();
    expect(peer.name).toBe('Peer Laptop A');
    expect(peer.host).toBe('192.168.1.45');

    // 2. Reject self packet (should not duplicate self in peer list)
    const selfPacket = Buffer.from(
      JSON.stringify({
        magic: 'LAN_DFS_DISCOVERY_V1',
        id: discoveryService.nodeId,
        name: 'Self Node',
        host: '192.168.1.10',
        port: 3000,
        timestamp: Date.now(),
      })
    );
    discoveryService.handleIncomingMessage(selfPacket, { address: '127.0.0.1', port: 41234 });
    const selfFound = discoveryService.getDiscoveredDevices().find((d) => d.id === discoveryService.nodeId);
    expect(selfFound).toBeUndefined();

    // 3. Reject invalid magic packet
    const badMagicPacket = Buffer.from(
      JSON.stringify({
        magic: 'INVALID_UNKNOWN_PROTOCOL',
        id: 'foreign-id',
        name: 'Unknown',
      })
    );
    discoveryService.handleIncomingMessage(badMagicPacket, { address: '192.168.1.77', port: 41234 });
    const invalidFound = discoveryService.getDiscoveredDevices().find((d) => d.id === 'foreign-id');
    expect(invalidFound).toBeUndefined();
  });

  it('DiscoveryService - should evict stale peers after TTL expiration', () => {
    const expiredPeerId = 'stale-peer-123';
    discoveryService.peers.set(expiredPeerId, {
      id: expiredPeerId,
      name: 'Old Offline Peer',
      host: '192.168.1.80',
      port: 3000,
      lastSeen: Date.now() - 20000, // 20s ago (> 10s default TTL)
      status: 'online',
    });

    // Run eviction
    discoveryService.evictStalePeers();

    const devices = discoveryService.getDiscoveredDevices();
    const found = devices.find((d) => d.id === expiredPeerId);
    expect(found).toBeUndefined();
  });
});
