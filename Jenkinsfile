pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "ftezedor/myapp:v1"
        KUBE_CONFIG = credentials('myapp-cluster-kubeconfig')  // Reference the kubeconfig secret
    }
    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build(DOCKER_IMAGE)
                }
            }
        }
        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-creds') {
                        docker.image(DOCKER_IMAGE).push()
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Apply Kubernetes manifests (e.g., deployment.yaml)
                    sh """
                        kubectl replace --force -f kubernetes/deployment.yaml
                        kubectl apply -f kubernetes/service.yaml
                    """
                }
            }
        }
    }
}
