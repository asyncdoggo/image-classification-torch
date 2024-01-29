from torchvision.models.resnet import ResNet50_Weights
import torch
import torch.nn as nn
import torchvision.models as models


class ClassifierWithBoundingBox(nn.Module):
    def __init__(self, num_classes):
        super(ClassifierWithBoundingBox, self).__init__()
        # Use a pre-trained ResNet model for classification
        self.resnet = models.resnet50(weights=ResNet50_Weights.DEFAULT)
        in_features = self.resnet.fc.in_features
        self.resnet.fc = nn.Linear(in_features, num_classes)

        # Add bounding box regression head
        self.bbox_head = nn.Sequential(
            nn.Linear(num_classes, 256),
            nn.ReLU(),
            nn.Linear(256, 4)  # 4 for [x,y,x1,y1]
        )

    def forward(self, x):
        features = self.resnet(x)
        bbox = self.bbox_head(features)
        return features, bbox
