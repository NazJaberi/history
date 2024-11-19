package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sort"
	"strconv"
	"sync"
)

type Score struct {
	Name  string `json:"name"`
	Rank  int    `json:"rank"`
	Score int    `json:"score"`
	Time  string `json:"time"`
}

type ScoreResponse struct {
	Scores     []Score `json:"scores"`
	TotalPages int     `json:"totalPages"`
	Rank       int     `json:"rank,omitempty"`
	Percentile int     `json:"percentile,omitempty"`
}

var (
	scores []Score
	mutex  sync.RWMutex
)

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

func handleScores(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case "GET":
		getScores(w, r)
	case "POST":
		postScore(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func main() {
	http.HandleFunc("/api/scores", handleScores)
	
	log.Println("Server starting on :5500")
	log.Fatal(http.ListenAndServe(":5500", nil))
}

func getScores(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 5
	}

	mutex.RLock()
	defer mutex.RUnlock()

	// Calculate pagination
	start := (page - 1) * limit
	end := start + limit
	if end > len(scores) {
		end = len(scores)
	}

	totalPages := (len(scores) + limit - 1) / limit

	response := ScoreResponse{
		Scores:     scores[start:end],
		TotalPages: totalPages,
	}

	json.NewEncoder(w).Encode(response)
}

func postScore(w http.ResponseWriter, r *http.Request) {
	var newScore Score
	if err := json.NewDecoder(r.Body).Decode(&newScore); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	// Add score and sort
	scores = append(scores, newScore)
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})

	// Update ranks
	for i := range scores {
		scores[i].Rank = i + 1
	}

	// Find submitted score's rank
	var rank int
	for i, s := range scores {
		if s.Name == newScore.Name && s.Score == newScore.Score && s.Time == newScore.Time {
			rank = i + 1
			break
		}
	}

	// Calculate percentile
	percentile := int(float64(len(scores)-rank) / float64(len(scores)) * 100)

	response := ScoreResponse{
		Scores:     scores[:min(5, len(scores))],
		TotalPages: (len(scores) + 4) / 5,
		Rank:       rank,
		Percentile: percentile,
	}

	json.NewEncoder(w).Encode(response)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}