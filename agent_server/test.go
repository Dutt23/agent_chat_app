package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/quic-go/webtransport-go"
)

func Test() {
	// Change to match your endpoint:
	url := "https://agent.chat.app:6122/agents/chat"

	cert, err := tls.LoadX509KeyPair("../cert.pem", "../key.pem")

	if err != nil {
		log.Fatalf("Failed to load X509 key pair: %v", err)
	}
	dialer := webtransport.Dialer{
		TLSClientConfig: &tls.Config{
			NextProtos:   []string{"h3"},
			Certificates: []tls.Certificate{cert},
		},
	}

	headers := http.Header{}
	// Establish a client-side WebTransport session
	rsp, session, err := dialer.Dial(context.Background(), url, headers)
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	if rsp.StatusCode/100 != 2 {
		log.Fatalf("Unexpected HTTP response status: %s", rsp.Status)
	}
	defer session.CloseWithError(0, "bye")

	fmt.Println("WebTransport session established.")

	// Open a bidirectional stream
	stream, err := session.OpenStreamSync(context.Background())
	if err != nil {
		log.Fatalf("Failed to open stream: %v", err)
	}
	defer stream.Close()

	msg := "Hello from Go WebTransport client!\n"
	n, err := stream.Write([]byte(msg))
	if err != nil {
		log.Fatalf("Failed to write: %v", err)
	}
	fmt.Printf("Sent: %s (%d bytes)\n", msg, n)

	// Read response (from echo server or agent)
	buf := make([]byte, 4096)
	n, err = stream.Read(buf)
	if err != nil && err != io.EOF {
		log.Fatalf("Failed to read: %v", err)
	}
	fmt.Printf("Received: %s\n", string(buf[:n]))
}
